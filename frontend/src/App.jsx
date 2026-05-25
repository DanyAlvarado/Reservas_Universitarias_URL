import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";

const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/reservations" element={<PrivateRoute><Reservations /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}