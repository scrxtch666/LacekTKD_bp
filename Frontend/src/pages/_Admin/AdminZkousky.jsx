import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Coins,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getUserRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import config from "../../../config";

const API = config.API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  location: "",
  registrable_date: "",
  price: "",
  status: "hidden",
};

function AdminZkousky() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [myFighterId, setMyFighterId] = useState(null);
  const userRole = getUserRole();
  const navigate = useNavigate();
  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";
  const headerText = isAdminOrTrainer ? "Správa zkoušek" : "Zkoušky";
  const [fighters, setFighters] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(null);
  const [selectedFighter, setSelectedFighter] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && userRole === "user") {
      fetch(`${API}/auth/me`, { headers: authHeader() })
        .then((res) => res.json())
        .then((data) => {
          if (data.fighter_id) setMyFighterId(data.fighter_id);
        });
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [myFighterId]);

  useEffect(() => {
    if (userRole === "admin" || userRole === "trainer") {
      fetch(`${API}/api/fighters`)
        .then((res) => res.json())
        .then((data) => setFighters(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, []);

  const handleAdminRegisterFighter = async () => {
    if (!selectedFighter) return alert("Vyber závodníka");
    setRegisterLoading(true);
    const res = await fetch(
      `${API}/api/exams/${showRegisterModal}/register/fighter/${selectedFighter}`,
      { method: "POST", headers: authHeader() },
    );
    const data = await res.json();
    if (res.ok) {
      setShowRegisterModal(null);
      setSelectedFighter("");
      fetchExams();
    } else {
      alert(data.error || "Nepodařilo se přihlásit závodníka");
    }
    setRegisterLoading(false);
  };

  const fetchExams = () => {
    const url =
      userRole === "admin" || userRole === "trainer"
        ? `${API}/api/exams/admin`
        : `${API}/api/exams`;

    fetch(url, { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => {
        setExams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title || !formData.date) {
      setError("Vyplňte název a datum.");
      return;
    }
    setSaving(true);
    const url = editingId
      ? `${API}/api/exams/${editingId}`
      : `${API}/api/exams`;
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        cancelForm();
        fetchExams();
      } else {
        const d = await res.json();
        setError(d.error || "Chyba při ukládání");
      }
    } catch {
      setError("Chyba při ukládání");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (exam) => {
    const toISODate = (d) => {
      if (!d) return "";
      const dateObj = new Date(d);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setEditingId(exam.id);
    setFormData({
      title: exam.title || "",
      description: exam.description || "",
      date: toISODate(exam.date),
      registrable_date: toISODate(exam.registrable_date),
      location: exam.location || "",
      price: exam.price || "",
      status: exam.status || "hidden",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
  };

  const handleToggleStatus = async (exam) => {
    const newStatus = exam.status === "active" ? "hidden" : "active";
    const res = await fetch(`${API}/api/exams/${exam.id}/status`, {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchExams();
  };

  const handleRegister = async (examId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/api/exams/${examId}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchExams();
      } else {
        alert(data.error || "Nepodařilo se přihlásit na turnaj.");
      }
    } catch {
      alert("Chyba při přihlašování na turnaj!");
    }
  };

  const handleUnregister = async (examId) => {
    if (!confirm("Odhlásit se ze zkoušek?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/exams/${examId}/register`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchExams();
    else alert("Nepodařilo se odhlásit");
  };

  const handleDelete = async (id) => {
    if (!confirm("Smazat tuto zkoušku?")) return;
    setDeleting(id);
    await fetch(`${API}/api/exams/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    fetchExams();
    setDeleting(null);
  };

  const handleAdminUnregister = async (regId) => {
    if (!confirm("Odhlásit závodníka?")) return;
    await fetch(`${API}/api/exams/registration/${regId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    fetchExams();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}.${month}.${year}`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Načítám...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">{headerText}</div>
        {!showForm && (userRole === "admin" || userRole === "trainer") && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Přidat zkoušku</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {editingId ? "Editace zkoušky" : "Nová zkouška"}
            </h3>
            <button
              onClick={cancelForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Zkoušky na technické stupně"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum zkoušky *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uzávěrka přihlášek
                </label>
                <input
                  type="date"
                  value={formData.registrable_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrable_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Místo
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tělocvična TKD Lacek"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cena (Kč)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="hidden">Skrytá</option>
                  <option value="active">Aktivní (zobrazena na webu)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Popis
                </label>
                <textarea
                  value={formData.description}
                  rows={4}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Informace o zkouškách, co si přinést, co očekávat..."
                />
              </div>
            </div>
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving
                  ? "Ukládám..."
                  : editingId
                    ? "Uložit změny"
                    : "Přidat zkoušku"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {exams.length === 0 ? (
        userRole === "user" ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-xl font-semibold text-gray-600">
              Momentálně nejsou vypsány žádné zkoušky
            </p>
            <p className="text-gray-400 text-sm">
              Sledujte aktuality pro informace o připravovaných zkouškách
            </p>
          </div>
        ) : (
          <div className="bg-customWhite rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Zatím nejsou žádné zkoušky</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-lg font-semibold text-gray-800">
                        {exam.title}
                      </p>
                      {(userRole === "admin" || userRole === "trainer") && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            exam.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {exam.status === "active" ? (
                            <>
                              <Eye size={11} className="inline mr-1" />
                              Aktivní
                            </>
                          ) : (
                            <>
                              <EyeOff size={11} className="inline mr-1" />
                              Skrytá
                            </>
                          )}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {exam.registrations?.length || 0} přihlášených
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      {exam.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {formatDate(exam.date)}
                        </span>
                      )}
                      {exam.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {exam.location}
                        </span>
                      )}
                      {exam.price && (
                        <span className="flex items-center gap-1">
                          <Coins size={13} /> {exam.price} Kč
                        </span>
                      )}
                      {exam.registrable_date && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <Calendar size={13} /> Uzávěrka:{" "}
                          {formatDate(exam.registrable_date)}
                        </span>
                      )}
                    </div>
                    {exam.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() =>
                        setExpanded(expanded === exam.id ? null : exam.id)
                      }
                      className="flex items-center gap-1 px-3 py-2 bg-customWhite border border-customGreen text-customBlack rounded-lg text-sm transition-colors"
                    >
                      {expanded === exam.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      Závodníci
                    </button>
                    {userRole === "user" &&
                      (() => {
                        const canRegister = exam.registrable_date
                          ? (() => {
                              const deadline = new Date(exam.registrable_date);
                              deadline.setHours(23, 59, 59, 999);
                              return new Date() <= deadline;
                            })()
                          : true;

                        const isRegistered = !!exam.is_registered;

                        if (!canRegister) {
                          return (
                            <span className="text-sm text-gray-400 border border-gray-200 px-3 py-2 rounded-lg bg-gray-50">
                              Po uzávěrce
                            </span>
                          );
                        }

                        if (isRegistered) {
                          return (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium">
                                ✓ Přihlášen
                              </span>
                              <button
                                onClick={() => handleUnregister(exam.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                              >
                                Odhlásit se
                              </button>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() => handleRegister(exam.id)}
                            className="bg-customGreen hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
                          >
                            <Plus size={18} /> Přihlásit se
                          </button>
                        );
                      })()}
                    {(userRole === "admin" || userRole === "trainer") && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(exam)}
                          className={`px-4 py-2 rounded-lg text-white text-sm transition-colors ${
                            exam.status === "active"
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {exam.status === "active" ? "Skrýt" : "Zveřejnit"}
                        </button>
                        <button
                          onClick={() => startEdit(exam)}
                          className="editBtn"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          disabled={deleting === exam.id}
                          className="deleteBtn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {(userRole === "admin" || userRole === "trainer") && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setShowRegisterModal(exam.id);
                      setSelectedFighter("");
                    }}
                    className="addBtn"
                  >
                    <Plus size={16} /> Přidat závodníka
                  </button>
                </div>
              )}
              {expanded === exam.id && (
                <div className="border-t border-gray-100">
                  {!exam.registrations?.length ? (
                    <p className="px-4 py-3 text-sm text-gray-400 italic">
                      Žádní přihlášení závodníci
                    </p>
                  ) : (
                    exam.registrations.map((reg) => (
                      <div
                        key={reg.reg_id}
                        onClick={() => navigate(`/zavodnik/${reg.fighter_id}`)}
                        className="flex items-center justify-between cursor-pointer px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {reg.fighter_pfp ? (
                            <img
                              src={`${API}${reg.fighter_pfp}`}
                              alt={reg.fighter_name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 noPfp">
                              {reg.fighter_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {reg.fighter_name} {reg.fighter_surname}
                            </p>
                            <p className="text-xs text-gray-400">{reg.cup}</p>
                          </div>
                        </div>
                        {(userRole === "admin" || userRole === "trainer") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdminUnregister(reg.reg_id);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs transition-colors"
                          >
                            <X size={12} /> Odhlásit
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showRegisterModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  Přihlásit závodníka na zkoušku
                </h3>
                <button
                  onClick={() => setShowRegisterModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <select
                value={selectedFighter}
                onChange={(e) => setSelectedFighter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">-- Vyber závodníka --</option>
                {fighters.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.surname}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAdminRegisterFighter}
                  disabled={registerLoading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {registerLoading ? "Přihlašuji..." : "Přihlásit"}
                </button>
                <button
                  onClick={() => setShowRegisterModal(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default AdminZkousky;
