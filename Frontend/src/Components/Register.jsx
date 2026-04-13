import { useState } from "react";
import { Link } from "react-router-dom";
import config from "../../config";

const API = config.API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    passwordConfirm: "",
    email: "",
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.login ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirm
    ) {
      setError("Vyplňte prosím všechna pole.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Heslo musí mít minimálně 6 znaků.");
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Hesla se neshodují.");
      return;
    }
    if (!gdprConsent) {
      setError(
        "Pro registraci musíte souhlasit se zpracováním osobních údajů.",
      );
      return;
    }

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setFormData({
          login: "",
          password: "",
          passwordConfirm: "",
          email: "",
        });
        setGdprConsent(false);
        setError("");
        alert(
          data.message || "Registrace odeslána! Počkej na schválení od admina.",
        );
      } else {
        setError(data.error || "Chyba při registraci.");
      }
    } catch {
      setError("Chyba při odesílání.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Registrace</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Uživatelské jméno"
          value={formData.login}
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Heslo"
          value={formData.password}
          className="w-full p-2 border rounded"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <div>
          <input
            type="password"
            placeholder="Zopakujte heslo"
            value={formData.passwordConfirm}
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setFormData({ ...formData, passwordConfirm: e.target.value })
            }
          />
          {formData.passwordConfirm &&
            formData.password !== formData.passwordConfirm && (
              <p className="text-xs text-red-500 mt-1">Hesla se neshodují</p>
            )}
          {formData.passwordConfirm &&
            formData.password === formData.passwordConfirm && (
              <p className="text-xs text-green-600 mt-1">✓ Hesla se shodují</p>
            )}
        </div>

        {/* GDPR checkbox */}
        <div
          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
            gdprConsent
              ? "border-green-300 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <input
            type="checkbox"
            id="gdpr"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer flex-shrink-0"
          />
          <label
            htmlFor="gdpr"
            className="text-sm text-gray-600 cursor-pointer leading-relaxed"
          >
            Souhlasím se{" "}
            <Link
              to="/gdpr"
              target="_blank"
              className="text-customGreen underline font-medium hover:text-green-700"
            >
              zpracováním osobních údajů
            </Link>{" "}
            v souladu s GDPR. Beru na vědomí, že moje údaje budou zpracovávány
            za účelem správy členství v oddílu TKD Lacek.
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          disabled={!gdprConsent}
          className={`w-full p-2 rounded transition text-white ${
            gdprConsent
              ? "bg-customGreen hover:bg-green-600 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Zaregistrovat se
        </button>
      </form>
    </div>
  );
};

export default Register;
