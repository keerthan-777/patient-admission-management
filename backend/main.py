
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from database import Base, engine, get_db
from models import Patient
from schemas import PatientCreate, PatientResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Patient Admission Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Patient Admission API is running"}


@app.post("/patients", response_model=PatientResponse, status_code=201)
def add_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = Patient(**patient.model_dump())

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient


@app.get("/patients", response_model=list[PatientResponse])
def get_patients(
    search: Optional[str] = None,
    ward: Optional[str] = None,
    department: Optional[str] = None,
    doctor: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Patient)

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))

    if ward:
        query = query.filter(Patient.ward == ward)

    if department:
        query = query.filter(Patient.department == department)

    if doctor:
        query = query.filter(Patient.doctor == doctor)

    return query.order_by(Patient.id.desc()).all()


@app.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return patient


@app.put("/patients/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    data: PatientCreate,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    for key, value in data.model_dump().items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)

    return patient


@app.patch("/patients/{patient_id}/discharge")
def discharge_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.status = "Discharged"

    db.commit()
    db.refresh(patient)

    return {
        "message": "Patient discharged successfully",
        "patient": patient
    }


@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}
