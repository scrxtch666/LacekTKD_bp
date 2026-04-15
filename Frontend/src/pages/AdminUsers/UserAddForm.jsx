import { useState } from "react";
import { X } from "lucide-react";

function UserAddForm({ roles, fighters, onSuccess, onCancel, API }) {
  const [form, setForm] = useState({
    login: "", email: "", password: "", passwordConfirm: "", role: "", fighter_id: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.login || !form.password || !form.passwordConfirm) return setError("Vyplňte všechna povinná pole.");
    if (form.password.length < 6) return setError("Heslo musí mít minimálně 6 znaků.");
    if (form.password !== form.passwordConfirm) return setError("Hesla se neshodují.");
    if (!form.role) return setError("Vyberte roli.");

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({
          login: form.login, password: form.password, email: form.email,
          role_id: form.role, fighter_id: form.fighter_id || null,
        }),
      });
      if (res.ok) { onSuccess(); }
      else { const d = await res.json(); setError(d.error || "Chyba při přidání"); }
    } catch { setError("Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Nový uživatel</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Login *", key: "login", type: "text", placeholder: "novak30" },
            { label: "Email", key: "email", type: "email", placeholder: "novak@email.cz" },
            { label: "Heslo *", key: "password", type: "password", placeholder: "••••••••" },
            { label: "Potvrzení hesla *", key: "passwordConfirm", type: "password", placeholder: "••••••••" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[key]} placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  key === "passwordConfirm" && form.passwordConfirm && form.password !== form.passwordConfirm
                    ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {key === "passwordConfirm" && form.passwordConfirm && (
                <p className={`text-xs mt-1 ${form.password === form.passwordConfirm ? "text-green-600" : "text-red-500"}`}>
                  {form.password === form.passwordConfirm ? "✓ Hesla se shodují" : "Hesla se neshodují"}
                </p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="">-- Vyber roli --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name === "user" ? "závodník" : r.role_name === "trainer" ? "trenér" : r.role_name === "admin" ? "administrátor" : r.role_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Závodník <span className="text-gray-400">(nepovinné)</span></label>
            <select value={form.fighter_id} onChange={(e) => setForm({ ...form, fighter_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="">-- Bez přiřazení --</option>
              {fighters.map((f) => <option key={f.id} value={f.id}>{f.name} {f.surname}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
            {saving ? "Ukládám..." : "Přidat uživatele"}
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserAddForm;