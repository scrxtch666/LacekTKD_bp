import { useState, useEffect } from "react";
import { authService } from "../../utils/auth";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  Users,
  Pencil,
  X,
  Check,
  KeyRound,
  TriangleAlert,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../../../config";

const API = config.API_URL;

function AdminMe() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const hasFighter = !!user?.fighter_id;

  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    actual_weight_category: "",
    birth: "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  useEffect(() => {
    authService.getCurrentUser().then((data) => {
      setUser(data);
      setForm({
        name: data?.name || "",
        surname: data?.surname || "",
        phone: data?.phone || "",
        email: data?.email || "",
        actual_weight_category: data?.actual_weight_category || "",
        birth: data?.birth || "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Validace hesla
    if (form.newPassword) {
      if (!form.currentPassword) {
        setError("Zadejte stávající heslo.");
        return;
      }
      if (form.newPassword.length < 6) {
        setError("Nové heslo musí mít minimálně 6 znaků.");
        return;
      }
      if (form.newPassword !== form.newPasswordConfirm) {
        setError("Nová hesla se neshodují.");
        return;
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          phone: form.phone,
          email: form.email,
          actual_weight_category:
            form.actual_weight_category === ""
              ? null
              : form.actual_weight_category,
          birth: form.birth === "" ? null : form.birth,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Nepodařilo se uložit změny.");
      } else {
        setSuccess("Profil byl úspěšně uložen.");
        setEditing(false);
        authService.getCurrentUser().then(setUser);
      }
    } catch {
      setError("Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
    setForm({
      name: user?.name || "",
      surname: user?.surname || "",
      phone: user?.phone || "",
      email: user?.email || "",
      actual_weight_category: user?.actual_weight_category || "",
      birth: user?.birth || "",
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Načítám profil...
      </div>
    );
  if (!user)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Nepodařilo se načíst uživatele
      </div>
    );

  const initials =
    user.name && user.surname
      ? `${user.name.charAt(0)}${user.surname.charAt(0)}`
      : user.login?.charAt(0).toUpperCase();

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return {
          label: "Administrátor",
          icon: <Shield size={12} />,
          className: "bg-red-50 text-red-600 border-red-200",
        };
      case "trainer":
        return {
          label: "Trenér",
          icon: <Users size={12} />,
          className: "bg-blue-50 text-blue-600 border-blue-200",
        };
      default:
        return {
          label: "Závodník",
          icon: <User size={12} />,
          className: "bg-green-50 text-customGreen border-green-200",
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="devider">Můj účet</div>

      <div className="grid gap-5 lg:grid-cols-2 md:grid-cols-1">
        <div className="bg-customWhite rounded-2xl shadow-md overflow-hidden w-full">
          <div className="h-24 bg-gradient-to-r from-customGreen to-green-400 relative">
            <div className="absolute -bottom-10 left-6">
              {user.img_path ? (
                <img
                  src={`${API}${user.img_path}`}
                  alt={user.login}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-customWhite shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-customWhite shadow-md bg-customGreen flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <div className="pt-14 px-6 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {user.name && user.surname
                    ? `${user.name} ${user.surname}`
                    : user.login}
                </h2>
                <p className="text-sm text-gray-400">@{user.login}</p>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = getRoleBadge(user.role);
                  return (
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${badge.className}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  );
                })()}
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-full transition-colors"
                  >
                    <Pencil size={12} /> Upravit
                  </button>
                )}
              </div>
            </div>
          </div>
          {!hasFighter && (
            <div className="mx-6 mt-4 mb-2">
              <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-100 flex-shrink-0">
                  <TriangleAlert size={18} className="text-yellow-700" />
                </div>

                <div className="text-sm text-yellow-800">
                  <strong>Upozornění:</strong> K tomuto účtu není přiřazen žádný
                  závodník! Nelze se přihlašovat na zkoušky a turnaje!
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 mx-6" />

          {!editing ? (
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Mail size={15} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-gray-700">{user.email}</p>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Phone size={15} className="text-customGreen" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Telefon</p>
                    <p className="font-medium text-gray-700">{user.phone}</p>
                  </div>
                </div>
              )}

              {hasFighter && user.birth && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={15} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Datum narození</p>
                    <p className="font-medium text-gray-700">
                      {new Date(user.birth).toLocaleDateString("cs-CZ")}
                    </p>
                  </div>
                </div>
              )}
              {hasFighter && user.actual_weight_category && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <User size={15} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Váhová kategorie</p>
                    <p className="font-medium text-gray-700">
                      {user.actual_weight_category} kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasFighter && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Jméno
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Příjmení
                      </label>
                      <input
                        type="text"
                        value={form.surname}
                        onChange={(e) =>
                          setForm({ ...form, surname: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Email
                  </label>
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                  />
                </div>

                {hasFighter && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Datum narození
                      </label>
                      <input
                        type="date"
                        value={form.birth}
                        onChange={(e) =>
                          setForm({ ...form, birth: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Váhová kategorie (kg)
                      </label>
                      <input
                        type="number"
                        value={form.actual_weight_category}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            actual_weight_category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound size={15} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Změna hesla
                  </span>
                  <span className="text-xs text-gray-400">(nepovinné)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Stávající heslo
                    </label>
                    <input
                      type="password"
                      value={form.currentPassword}
                      onChange={(e) =>
                        setForm({ ...form, currentPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Nové heslo
                    </label>
                    <input
                      type="password"
                      value={form.newPassword}
                      onChange={(e) =>
                        setForm({ ...form, newPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Potvrdit heslo
                    </label>
                    <input
                      type="password"
                      value={form.newPasswordConfirm}
                      onChange={(e) =>
                        setForm({ ...form, newPasswordConfirm: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-customGreen focus:border-transparent ${
                        form.newPasswordConfirm &&
                        form.newPassword !== form.newPasswordConfirm
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    {form.newPasswordConfirm &&
                      form.newPassword !== form.newPasswordConfirm && (
                        <p className="text-xs text-red-500 mt-1">
                          Hesla se neshodují
                        </p>
                      )}
                    {form.newPasswordConfirm &&
                      form.newPassword === form.newPasswordConfirm && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Hesla se shodují
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-customGreen hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  <Check size={15} />
                  {saving ? "Ukládám..." : "Uložit změny"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
                >
                  <X size={15} /> Zrušit
                </button>
              </div>
            </div>
          )}

          {success && !editing && (
            <div className="mx-6 mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {success}
            </div>
          )}
        </div>

        {user.tournament_results?.length > 0 && (
          <div className="px-6 pb-5 bg-customWhite rounded-2xl shadow-md overflow-hidden w-full">
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Výsledky z turnajů
              </p>
              <div className="space-y-2">
                {user.tournament_results.map((result, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/turnaj/${result.tournament_id}`)}
                    className="flex justify-between border-b cursor-pointer pb-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{result.tournament}</p>
                      <p className="text-gray-400 flex items-center gap-1">
                        <Calendar size={14} /> {result.date}
                      </p>
                    </div>

                    <div className="font-semibold">{result.place}. místo</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMe;
