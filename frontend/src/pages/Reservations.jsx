import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const load = () => api.get("/reservations/").then(res => setReservations(res.data));

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    setMessage({ text: "", type: "" });
    try {
      await api.delete(`/reservations/${id}/cancel`);
      setMessage({ text: "Reserva cancelada exitosamente", type: "success" });
      load();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Error al cancelar", type: "error" });
    }
  };

  const filtered = filter === "all" ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div>
      <nav className="navbar">
        <h1>🏛️ Reservas URL</h1>
        <div className="navbar-actions">
          <button className="btn btn-outline" onClick={() => navigate("/")}>Volver al inicio</button>
          <button className="btn btn-outline" onClick={() => { localStorage.clear(); navigate("/login"); }}>Salir</button>
        </div>
      </nav>

      <div className="page">
        <p className="page-title">Mis Reservas</p>
        <p className="page-subtitle">Historial y gestión de tus reservas activas</p>

        <div className="filters">
          {[["all", "Todas"], ["active", "Activas"], ["cancelled", "Canceladas"]].map(([val, label]) => (
            <button key={val} className={`filter-btn ${filter === val ? "active" : ""}`}
              onClick={() => setFilter(val)}>
              {label}
            </button>
          ))}
        </div>

        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {filtered.length === 0
          ? <div className="card" style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
              No hay reservas para mostrar
            </div>
          : filtered.map(r => (
            <div key={r.id} className="reservation-card">
              <div className="reservation-info">
                <h4>{r.resource_name}</h4>
                <p>📅 {r.start_time.slice(0, 10)} &nbsp; 🕐 {r.start_time.slice(11, 16)} — {r.end_time.slice(11, 16)}</p>
                <p>📝 {r.purpose || "Sin proposito especificado"}</p>
                <span className={`badge badge-${r.status === "active" ? "active" : "cancelled"}`}>
                  {r.status === "active" ? "Activa" : "Cancelada"}
                </span>
              </div>
              {r.status === "active" && (
                <button className="btn btn-danger btn-sm" onClick={() => cancel(r.id)}>
                  Cancelar
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}