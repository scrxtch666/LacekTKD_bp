import { useState } from "react";
import { Pencil, Trash2, Mail, Shield, X, Check, ShieldCheck, User, Users } from "lucide-react";

const getRoleBadge = (role) => {
  switch (role) {
    case "admin": return { label: "Administrátor", icon: <Shield size={12} />, className: "bg-red-50 text-red-600" };
    case "trainer": return { label: "Trenér", icon: <Users size={12} />, className: "bg-blue-50 text-blue-600" };
    default: return { label: "Závodník", icon: <User size={12} />, className: "bg-green-50 text-customGreen" };
  }
};

function UserCard({ user, roles, fighters, isEditing, onStartEdit, onCancelEdit, onEditSuccess, onDelete, isDeleting, API }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const startEdit = () => {
    setForm({
      login: user.login || "", email: user.email || "",
      password: "", passwordConfirm: "",
      role: user.role_id || "", fighter_id: user.fighter_id || "",
    });
    setError("");
    onStartEdit();
  };

  const handleSave = async () => {
    setError("");
    if (!form.login) return setError("Login nesmí být prázdný.");
    if (form.password && form.password.length < 6) return setError("Heslo musí mít alespoň 6 znaků.");
    if (form.password && form.password !== form.passwordConfirm) return setError("Hesla se neshodují.");
    if (!form.role) return setError("Vyberte roli.");

    setSaving(true);
    const payload = { login: form.login, email: form.email, role_id: form.role, fighter_id: form.fighter_id || null };
    if (form.password) payload.password = form.password;

    try {
      const res = await fetch(`${API}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(payload),
      });
      if (res.ok) onEditSuccess();
      else { const d = await res.json(); setError(d.error || "Chyba při ukládání"); }
    } catch { setError("Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  if (isEditing) return (
    <div className="bg-customWhite rounded-lg shadow-md p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Editace uživatele #{user.id}</span>
        <button onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Login *", key: "login", type: "text" },
          { label: "Email", key: "email", type: "email" },
          { label: "Nové heslo", key: "password", type: "password" },
          { label: "Potvrzení hesla", key: "passwordConfirm", type: "password" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type={type} value={form[key] || ""} placeholder="••••••••"
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            {key === "passwordConfirm" && form.passwordConfirm && (
              <p className={`text-xs mt-1 ${form.password === form.passwordConfirm ? "text-green-600" : "text-red-500"}`}>
                {form.password === form.passwordConfirm ? "✓ Shodují se" : "Neshodují se"}
              </p>
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">-- Vyber roli --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role_name === "user" ? "závodník" : r.role_name === "trainer" ? "trenér" : r.role_name === "admin" ? "administrátor" : r.role_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Závodník <span className="text-gray-400">(nepovinné)</span></label>
          <select value={form.fighter_id} onChange={(e) => setForm({ ...form, fighter_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">-- Bez přiřazení --</option>
            {fighters.map((f) => <option key={f.id} value={f.id}>{f.name} {f.surname}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50">
          <Check size={16} />{saving ? "Ukládám..." : "Uložit změny"}
        </button>
        <button onClick={onCancelEdit} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
          Zrušit
        </button>
      </div>
    </div>
  );

  const badge = getRoleBadge(user.role_name);

  return (
    <div className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold flex-shrink-0">
          {user.id}
        </span>
        <div className="flex-shrink-0">
          {user.img_path ? (
            <img src={`${API}${user.img_path}`} alt={user.login} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 noPfp">{user.login?.charAt(0).toUpperCase() || "U"}</div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-lg font-semibold text-gray-800">{user.name} {user.surname}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1 justify-center sm:justify-start">
            <span>login: {user.login}</span>
            {user.email && <><Mail size={14} /><span>{user.email}</span></>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
              {badge.icon}{badge.label}
            </span>
            {user.fighter_id && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <ShieldCheck size={11} /> Přiřazený účet
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={startEdit} className="editBtn"><Pencil size={18} /><span>Editovat</span></button>
          <button onClick={onDelete} disabled={isDeleting} className="deleteBtn disabled:opacity-50">
            <Trash2 size={18} /><span>{isDeleting ? "Mažu..." : "Smazat"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserCard;