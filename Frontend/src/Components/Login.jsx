import { useState } from "react";
import { Navigate, redirect, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import config from "../../config";

const API = config.API_URL;
const Login = () => {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.token) {
        // Uložení tokenu do paměti prohlížeče
        localStorage.setItem("token", data.token);
        if (data.token) {
          localStorage.setItem("token", data.token);

          window.dispatchEvent(new Event("authChange"));
          const role = getUserRole();

          if (role === "admin") {
            navigate("/admin/me", { replace: true });
          } else if (role === "trainer") {
            navigate("/admin/me", { replace: true });
          } else {
            navigate("/admin/me", { replace: true });
          }
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Chyba přihlášení:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border-t-4 border-customGreen">
      <h2 className="text-2xl font-bold mb-4">Přihlášení</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Uživatelské jméno"
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
        />
        <input
          type="password"
          placeholder="Heslo"
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button className="w-full bg-customGreen text-white p-2 rounded">
          Přihlásit se
        </button>
      </form>
    </div>
  );
};

export default Login;
