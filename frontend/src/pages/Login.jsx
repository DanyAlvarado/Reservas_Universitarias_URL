import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#002D62", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 12, padding: 40, width: 380, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: "#002D62", borderRadius: 12, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 24 }}>🏛️</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#002D62" }}>Sistema de Reservas</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Universidad Rafael Landívar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario institucional</label>
            <input placeholder="ej. estudiante1" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: 11, marginTop: 4 }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}