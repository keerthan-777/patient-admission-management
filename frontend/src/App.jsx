
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users, UserPlus, Search, Activity, BedDouble,
  Pencil, Trash2, LogOut, X, CheckCircle, Clock
} from "lucide-react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const OPTIONS = {
  gender: ["Male", "Female", "Other"],
  ward: ["General Ward", "ICU", "Emergency Ward", "Private Ward"],
  department: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine"],
  doctor: ["Dr. Sharma", "Dr. Kumar", "Dr. Priya", "Dr. Rahul"]
};

const emptyForm = {
  name: "", age: "", gender: "", ward: "",
  department: "", doctor: "",
  admission_date: new Date().toISOString().slice(0, 10),
  status: "Admitted"
};

function App() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [ward, setWard] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/patients`, {
        params: {
          search: search || undefined,
          ward: ward || undefined,
          department: department || undefined,
          doctor: doctor || undefined
        }
      });
      setPatients(res.data);
      setError("");
    } catch {
      setError("Unable to connect to the server. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadPatients, 250);
    return () => clearTimeout(timer);
  }, [search, ward, department, doctor]);

  const stats = useMemo(() => ({
    total: patients.length,
    admitted: patients.filter(p => p.status === "Admitted").length,
    discharged: patients.filter(p => p.status === "Discharged").length
  }), [patients]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, admission_date: new Date().toISOString().slice(0, 10) });
    setError("");
    setShowForm(true);
  };

  const openEdit = (patient) => {
    setEditing(patient.id);
    setForm({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      ward: patient.ward,
      department: patient.department,
      doctor: patient.doctor,
      admission_date: patient.admission_date,
      status: patient.status
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[A-Za-z ]+$/.test(form.name.trim())) {
      setError("Name must contain letters only.");
      return;
    }

    if (form.age === "" || Number(form.age) < 0 ||
        Number(form.age) > 120 || !Number.isInteger(Number(form.age))) {
      setError("Age must be a whole number between 0 and 120.");
      return;
    }

    if (!form.gender || !form.ward || !form.department || !form.doctor) {
      setError("Please select all required fields.");
      return;
    }

    if (!form.admission_date ||
        form.admission_date > new Date().toLocaleDateString("en-CA")) {
      setError("Admission date is required and cannot be in the future.");
      return;
    }

    const payload = { ...form, name: form.name.trim(), age: Number(form.age) };

    try {
      if (editing) {
        await axios.put(`${API}/patients/${editing}`, payload);
      } else {
        await axios.post(`${API}/patients`, payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      await loadPatients();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail :
        Array.isArray(detail) ? detail.map(x => x.msg).join(", ") :
        "Unable to save patient.");
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await axios.delete(`${API}/patients/${id}`);
      await loadPatients();
    } catch {
      alert("Unable to delete patient.");
    }
  };

  const dischargePatient = async (id) => {
    if (!window.confirm("Mark this patient as discharged?")) return;
    try {
      await axios.patch(`${API}/patients/${id}/discharge`);
      await loadPatients();
    } catch {
      alert("Unable to discharge patient.");
    }
  };

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Activity size={23}/></div>
          <div><strong>MediCare</strong><small>Hospital Management</small></div>
        </div>
        <div className="nav-label">MAIN MENU</div>
        <div className="nav-item active"><Users size={19}/> Patients</div>
        <div className="sidebar-bottom">
          <div className="profile-avatar">HS</div>
          <div><strong>Hospital Staff</strong><small>Administrator</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Dashboard / Patients</div>
            <h1>Patient Management</h1>
            <p>Manage patient admissions and hospital records.</p>
          </div>
          <button className="primary-btn" onClick={openAdd}>
            <UserPlus size={18}/> Add Patient
          </button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue"><Users/></div>
            <div><span>Total Patients</span><h2>{stats.total}</h2></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Activity/></div>
            <div><span>Admitted</span><h2>{stats.admitted}</h2></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><LogOut/></div>
            <div><span>Discharged</span><h2>{stats.discharged}</h2></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><BedDouble/></div>
            <div><span>Wards</span><h2>{new Set(patients.map(p => p.ward)).size}</h2></div>
          </div>
        </section>

        <section className="content-card">
          <div className="table-heading">
            <div><h2>Patient Records</h2><p>View and manage all admitted patients.</p></div>
            <span className="record-count">{stats.total} Records</span>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={18}/>
              <input placeholder="Search patient name..." value={search}
                onChange={e => setSearch(e.target.value)}/>
            </div>
            <select value={ward} onChange={e => setWard(e.target.value)}>
              <option value="">All Wards</option>
              {OPTIONS.ward.map(x => <option key={x}>{x}</option>)}
            </select>
            <select value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              {OPTIONS.department.map(x => <option key={x}>{x}</option>)}
            </select>
            <select value={doctor} onChange={e => setDoctor(e.target.value)}>
              <option value="">All Doctors</option>
              {OPTIONS.doctor.map(x => <option key={x}>{x}</option>)}
            </select>
          </div>

          {error && !showForm && <div className="error-banner">{error}</div>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PATIENT</th><th>AGE / GENDER</th>
                  <th>WARD</th><th>DEPARTMENT</th>
                  <th>DOCTOR</th><th>ADMISSION DATE</th>
                  <th>STATUS</th><th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="empty">Loading patients...</td></tr>
                ) : patients.length === 0 ? (
                  <tr><td colSpan="8" className="empty">No patient records found.</td></tr>
                ) : patients.map(p => (
                  <tr key={p.id}>
                    <td><div className="patient-name"><div className="patient-avatar">{p.name.charAt(0).toUpperCase()}</div><strong>{p.name}</strong></div></td>
                    <td>{p.age} / {p.gender}</td>
                    <td>{p.ward}</td><td>{p.department}</td>
                    <td>{p.doctor}</td><td>{p.admission_date}</td>
                    <td><span className={`status ${p.status.toLowerCase()}`}>{p.status}</span></td>
                    <td>
                      <div className="actions">
                        <button title="Edit" className="icon-btn edit" onClick={() => openEdit(p)}><Pencil size={16}/></button>
                        {p.status === "Admitted" &&
                          <button title="Discharge" className="icon-btn discharge" onClick={() => dischargePatient(p.id)}><CheckCircle size={16}/></button>}
                        <button title="Delete" className="icon-btn delete" onClick={() => deletePatient(p.id)}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <footer>© 2026 MediCare Hospital Management System</footer>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><h2>{editing ? "Edit Patient" : "Add New Patient"}</h2><p>Enter patient information below.</p></div>
              <button className="close-btn" onClick={() => setShowForm(false)}><X/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>Patient Name *
                <input name="name" value={form.name} onChange={updateField} placeholder="Enter full name" required/>
              </label>
              <div className="form-grid">
                <label>Age *
                  <input name="age" type="number" min="0" max="120" value={form.age} onChange={updateField} placeholder="Age" required/>
                </label>
                <label>Gender *
                  <select name="gender" value={form.gender} onChange={updateField} required>
                    <option value="">Select gender</option>{OPTIONS.gender.map(x=><option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>Ward *
                  <select name="ward" value={form.ward} onChange={updateField} required>
                    <option value="">Select ward</option>{OPTIONS.ward.map(x=><option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>Department *
                  <select name="department" value={form.department} onChange={updateField} required>
                    <option value="">Select department</option>{OPTIONS.department.map(x=><option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>Doctor *
                  <select name="doctor" value={form.doctor} onChange={updateField} required>
                    <option value="">Select doctor</option>{OPTIONS.doctor.map(x=><option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>Admission Date *
                  <input name="admission_date" type="date" max={new Date().toISOString().slice(0,10)} value={form.admission_date} onChange={updateField} required/>
                </label>
              </div>
              {error && <div className="error-banner">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{editing ? "Save Changes" : "Add Patient"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
