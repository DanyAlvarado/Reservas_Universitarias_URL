import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const TYPE_LABELS = { lab: "Laboratorios", room: "Salones", cubicle: "Cubiculos", projector: "Proyectores" };
const TYPE_ICONS = { lab: "🖥️", cubicle: "📚", projector: "📽️", room: "🏫" };

export default function Dashboard() {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [date, setDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [form, setForm] = useState({ start_time: "", end_time: "", purpose: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    api.get("/resources/").then(res => setResources(res.data));
  }, []);

  const filtered = filter === "all" ? resources : resources.filter(r => r.resource_type === filter);

  const checkAvailability = async () => {
    if (!selectedResource || !date) return;
    const res = await api.get(`/resources/${selectedResource.id}/availability?date=${date}`);
    setAvailability(res.data);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      await api.post("/reservations/", {
        resource_id: selectedResource.id,
        start_time: form.start_time,
        end_time: form.end_time,
        purpose: form.purpose,
      });
      setMessage({ text: "Reserva creada exitosamente", type: "success" });
      checkAvailability();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Error al crear reserva", type: "error" });
    }
  };

  const selectResource = (r) => {
    setSelectedResource(r);
    setAvailability(null);
    setMessage({ text: "", type: "" });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>🏛️ Reservas URL</h1>
        <div className="navbar-actions">
          <span>Hola, {user?.full_name}</span>
          <button className="btn btn-outline" onClick={() => navigate("/reservations")}>Mis Reservas</button>
          <button className="btn btn-outline" onClick={() => { localStorage.clear(); navigate("/login"); }}>Salir</button>
        </div>
      </nav>

      <div className="page">
        <p className="page-title">Espacios disponibles</p>
        <p className="page-subtitle">Selecciona un espacio para consultar disponibilidad y reservar</p>

        <div className="filters">
          {[["all", "Todos"], ["lab", "Laboratorios"], ["room", "Salones"], ["cubicle", "Cubiculos"], ["projector", "Proyectores"]].map(([val, label]) => (
            <button key={val} className={`filter-btn ${filter === val ? "active" : ""}`}
              onClick={() => { setFilter(val); setSelectedResource(null); setAvailability(null); }}>
              {label}
            </button>
          ))}
        </div>

        {["lab", "room", "cubicle", "projector"].map(type => {
          const typeResources = filtered.filter(r => r.resource_type === type);
          if (typeResources.length === 0) return null;
          return (
            <div key={type} style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#002D62", borderBottom: "2px solid #002D62", paddingBottom: 6 }}>
                {TYPE_ICONS[type]} {TYPE_LABELS[type]}
              </p>
              <div className="resource-grid">
                {typeResources.map(r => (
                  <div key={r.id} className={`resource-card ${selectedResource?.id === r.id ? "selected" : ""}`}
                    onClick={() => selectResource(r)}>
                    <h4>{r.name}</h4>
                    <p>{r.location}</p>
                    {r.capacity && <p style={{ marginTop: 4 }}>Capacidad: {r.capacity}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {selectedResource && (
          <div className="card" ref={formRef}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              {TYPE_ICONS[selectedResource.resource_type]} {selectedResource.name} — {selectedResource.location}
            </h3>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Consultar disponibilidad</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={checkAvailability}>Consultar</button>
            </div>

            {availability && (
              <div style={{ marginBottom: 20 }}>
                {availability.busy_slots.length === 0
                  ? <span className="badge badge-available">Disponible todo el dia</span>
                  : <>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Horarios ocupados:</p>
                      {availability.busy_slots.map((s, i) => (
                        <div key={i} className="availability-row">
                          {s.start.slice(11, 16)} — {s.end.slice(11, 16)}
                        </div>
                      ))}
                    </>}
              </div>
            )}

            <form onSubmit={handleReserve}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Inicio</label>
                  <input type="datetime-local" value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Fin</label>
                  <input type="datetime-local" value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Proposito (opcional)</label>
                <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}
                  placeholder="ej. Practica de redes" />
              </div>
              {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
              <button type="submit" className="btn btn-primary">Reservar</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}