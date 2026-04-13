import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  X,
  Pencil,
  Upload,
  Trophy,
  MapPin,
  Calendar,
  Coins,
  CalendarOff,
} from "lucide-react";
import { getUserRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import config from "../../../config";

const API = config.API_URL;

const TournamentForm = ({
  data,
  setData,
  onSubmit,
  onCancel,
  isSaving,
  error,
  previewImg,
  onImageChange,
  isEdit,
  types,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Název turnaje *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Bratislava Open 2026"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Místo konání *
        </label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => setData({ ...data, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Praha"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cena (Kč) *
        </label>
        <input
          type="number"
          value={data.price}
          onChange={(e) => setData({ ...data, price: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Typ *
        </label>
        <select
          value={data.type_id}
          onChange={(e) => setData({ ...data, type_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">-- Vyber typ --</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={data.status}
          onChange={(e) => setData({ ...data, status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="completed">Aktivní (zobrazena na webu)</option>
          <option value="uncompleted">Skrytá</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Datum začátku *
        </label>
        <input
          type="date"
          value={data.start_date}
          onChange={(e) => setData({ ...data, start_date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Datum konce
        </label>
        <input
          type="date"
          value={data.end_date}
          onChange={(e) => setData({ ...data, end_date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Uzávěrka přihlášek *
        </label>
        <input
          type="date"
          value={data.registrable_date}
          onChange={(e) =>
            setData({ ...data, registrable_date: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Popis / info
        </label>
        <textarea
          value={data.info}
          rows={3}
          onChange={(e) => setData({ ...data, info: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          placeholder="Další informace o turnaji..."
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fotka / plakát{" "}
        {isEdit && (
          <span className="text-gray-400 font-normal">
            (nepovinné – ponechá stávající)
          </span>
        )}
      </label>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm">
          <Upload size={16} />
          <span>Vybrat soubor</span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
        </label>
        {data.image && (
          <span className="text-sm text-gray-600">{data.image.name}</span>
        )}
      </div>
      {previewImg && (
        <img
          src={previewImg}
          alt="Náhled"
          className="mt-2 h-28 object-contain rounded-lg border border-gray-200"
        />
      )}
    </div>
    {error && (
      <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
        {error}
      </div>
    )}
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={isSaving}
        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Ukládám..." : isEdit ? "Uložit změny" : "Přidat turnaj"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
      >
        Zrušit
      </button>
    </div>
  </form>
);

function AdminTurnaje() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const [types, setTypes] = useState([]);
  const [userRole, setUserRole] = useState(getUserRole());
  const [activeTab, setActiveTab] = useState("turnaje");
  const [registrations, setRegistrations] = useState([]);
  const [loadingReg, setLoadingReg] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: "",
    location: "",
    price: "",
    type_id: "",
    start_date: "",
    end_date: "",
    registrable_date: "",
    info: "",
    image: null,
    status: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTournament, setEditTournament] = useState({});
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";
  const headerText = isAdminOrTrainer ? "Správa turnajů" : "Turnaje";

  const [search, setSearch] = useState("");
  const [filterActual, setFilterActual] = useState(false);
  const [filterOld, setFilterOld] = useState(false);
  const [filterTournament, setFilterTournament] = useState("");

  const [fighters, setFighters] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(null);
  const [selectedFighter, setSelectedFighter] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => setUserRole(getUserRole());
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/fighters`)
      .then((res) => res.json())
      .then((data) => setFighters(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchTournaments();
    fetchTypes();
  }, []);

  const fetchTournaments = () => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/tournaments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setTournaments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTournaments([]);
        setLoading(false);
      });
  };

  const fetchTypes = () => {
    fetch(`${API}/api/tournaments/types`)
      .then((res) => res.json())
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchRegistrations = () => {
    setLoadingReg(true);

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Žádný token");
      setLoadingReg(false);
      return;
    }

    fetch(`${API}/api/tournamentRegistration`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRegistrations(data);
        } else if (Array.isArray(data.data)) {
          setRegistrations(data.data);
        } else {
          setRegistrations([]);
        }

        setLoadingReg(false);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setLoadingReg(false);
      });
  };

  const handleAdminRegisterFighter = async () => {
    if (!selectedFighter) return alert("Vyber závodníka");
    setRegisterLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API}/api/tournamentRegistration/${showRegisterModal}/fighter/${selectedFighter}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await response.json();
    if (response.ok) {
      setShowRegisterModal(null);
      setSelectedFighter("");
      fetchRegistrations();
    } else {
      alert(data.error || "Nepodařilo se přihlásit závodníka");
    }
    setRegisterLoading(false);
  };

  const handleRegister = async (tournamentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/api/tournaments/${tournamentId}/register`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (response.ok) {
        fetchTournaments();
      } else {
        alert(data.error || "Nepodařilo se přihlásit na turnaj.");
      }
    } catch {
      alert("Chyba při přihlašování na turnaj!");
    }
  };

  const handleToggleStatus = async (tournament) => {
    const newStatus =
      tournament.status === "completed" ? "uncompleted" : "completed";
    if (
      !confirm(
        `Označit jako "${newStatus === "completed" ? "Zveřejněný" : "Nezveřejněný"}"?`,
      )
    )
      return;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API}/api/tournaments/${tournament.id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      },
    );
    if (response.ok) fetchTournaments();
    else alert("Nepodařilo se změnit status");
  };

  const handleUnregister = async (tournamentId) => {
    if (!confirm("Opravdu se chcete odhlásit z turnaje?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/api/tournaments/${tournamentId}/register`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (response.ok) fetchTournaments();
      else alert(data.error || "Nepodařilo se odhlásit z turnaje.");
    } catch {
      alert("Chyba při odhlašování.");
    }
  };

  const handleAdminUnregister = async (registrationId) => {
    if (!confirm("Odhlásit závodníka?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API}/api/tournamentRegistration/${registrationId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) fetchRegistrations();
    else alert("Nepodařilo se odhlásit závodníka");
  };

  const validateForm = (data, setError) => {
    if (!data.name) {
      setError("Vyplňte prosím název turnaje.");
      return false;
    }
    if (!data.location) {
      setError("Vyplňte prosím místo konání.");
      return false;
    }
    if (!data.price) {
      setError("Vyplňte prosím cenu.");
      return false;
    }
    if (!data.type_id) {
      setError("Vyberte prosím typ akce.");
      return false;
    }
    if (!data.start_date) {
      setError("Vyplňte prosím datum začátku.");
      return false;
    }
    if (!data.registrable_date) {
      setError("Vyplňte prosím uzávěrku přihlášek.");
      return false;
    }
    return true;
  };

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tento turnaj?")) return;
    setDeleting(id);
    try {
      const response = await fetch(`${API}/api/tournaments/${id}`, {
        method: "DELETE",
      });
      if (response.ok) setTournaments(tournaments.filter((t) => t.id !== id));
      else alert("Nepodařilo se smazat turnaj");
    } catch {
      alert("Chyba při mazání turnaje");
    } finally {
      setDeleting(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTournament({ ...newTournament, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm(newTournament, setFormError)) return;
    setSaving(true);
    const formData = new FormData();
    Object.entries(newTournament).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val || "");
    });
    try {
      const response = await fetch(`${API}/api/tournaments`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        cancelAdd();
        fetchTournaments();
      } else {
        const err = await response.json();
        setFormError("Chyba: " + (err.error || "Nepodařilo se přidat turnaj"));
      }
    } catch {
      setFormError("Chyba při ukládání turnaje.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResult = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API}/api/tournamentRegistration/${editingResult.regId}/result`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ place: editingResult.place }),
      },
    );
    if (response.ok) {
      setEditingResult(null);
      fetchRegistrations();
    } else {
      alert("Nepodařilo se uložit výsledek");
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormError("");
    setPreviewUrl(null);
    setNewTournament({
      name: "",
      location: "",
      price: "",
      type_id: "",
      start_date: "",
      end_date: "",
      registrable_date: "",
      info: "",
      image: null,
      status: "",
    });
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditTournament({
      name: t.name || "",
      location: t.location || "",
      price: t.price || "",
      type_id: t.type_id || "",
      start_date: t.start_date_raw?.substring(0, 10) || "",
      end_date: t.end_date_raw?.substring(0, 10) || "",
      registrable_date: t.registrable_date_raw?.substring(0, 10) || "",
      info: t.info || "",
      image: null,
      status: t.status || "",
    });
    setEditPreviewUrl(null);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTournament({});
    setEditPreviewUrl(null);
    setEditError("");
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditTournament({ ...editTournament, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setEditPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (id) => {
    setEditError("");
    if (!validateForm(editTournament, setEditError)) return;
    setEditSaving(true);
    const formData = new FormData();
    Object.entries(editTournament).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val || "");
    });
    try {
      const response = await fetch(`${API}/api/tournaments/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        cancelEdit();
        fetchTournaments();
      } else {
        const err = await response.json();
        setEditError("Chyba: " + (err.error || "Nepodařilo se uložit změny"));
      }
    } catch {
      setEditError("Chyba při ukládání turnaje.");
    } finally {
      setEditSaving(false);
    }
  };

  const getColorClass = (date) => {
    const today = new Date();
    const target = new Date(date);

    const diffTime = target - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "text-red-600";
    if (diffDays <= 3) return "text-orange-500";
    return "text-green-600";
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("cs-CZ") : "—";

  const today = new Date().setHours(0, 0, 0, 0);

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

    const tourDate = new Date(t.end_date_raw || t.start_date_raw).setHours(
      0,
      0,
      0,
      0,
    );
    const isActual = tourDate >= today;
    const isOld = tourDate < today;

    const timeFilterActive = filterActual || filterOld;
    const matchesTime =
      !timeFilterActive || (filterActual && isActual) || (filterOld && isOld);

    const matchesStatus =
      filterTournament === "" ||
      (filterTournament === "completed" && t.status === "completed") ||
      (filterTournament === "uncompleted" && t.status !== "completed");

    const matchesRole = userRole !== "user" || t.status === "completed";

    return matchesSearch && matchesTime && matchesStatus && matchesRole;
  });

  const hasActiveFilter =
    search || filterOld || filterActual || filterTournament;
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám turnaje...</div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">{headerText}</div>
        {!showAddForm &&
          activeTab === "turnaje" &&
          (userRole === "admin" || userRole === "trainer") && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Přidat turnaj</span>
            </button>
          )}
      </div>

      {showAddForm && (
        <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Nový turnaj</h3>
            <button
              onClick={cancelAdd}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <TournamentForm
            data={newTournament}
            setData={setNewTournament}
            onSubmit={handleSubmit}
            onCancel={cancelAdd}
            isSaving={saving}
            error={formError}
            previewImg={previewUrl}
            onImageChange={handleImageChange}
            isEdit={false}
            types={types}
          />
        </div>
      )}

      <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat turnaj..."
          className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        />

        {(userRole === "admin" || userRole === "trainer") && (
          <select
            value={filterTournament}
            onChange={(e) => setFilterTournament(e.target.value)}
            className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
          >
            <option value="">Všechny turnaje</option>
            <option value="completed">✅ Zveřejněné</option>
            <option value="uncompleted">❌ Nezveřejněné</option>
          </select>
        )}
        <button
          onClick={() => setFilterActual(!filterActual)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterActual ? "bg-customGreen text-white border-customGreen" : "bg-customWhite border-gray-300"}`}
        >
          Aktuální
        </button>

        <button
          onClick={() => setFilterOld(!filterOld)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterOld ? "bg-customGreen text-white border-customGreen" : "bg-customWhite border-gray-300"}`}
        >
          Staré
        </button>

        {hasActiveFilter && (
          <button
            onClick={() => {
              setSearch("");
              setFilterActual(false);
              setFilterOld(false);
              setFilterTournament("");
            }}
            className="px-4 py-2 bg-customWhite border border-gray-300 rounded-lg text-sm transition-colors hover:bg-gray-50"
          >
            Zrušit filtry
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("turnaje")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "turnaje" ? "border-customGreen text-customGreen" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Turnaje
        </button>
        <button
          onClick={() => {
            setActiveTab("prihlasky");
            fetchRegistrations();
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "prihlasky" ? "border-customGreen text-customGreen" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Přihlášky
        </button>
      </div>

      {activeTab === "turnaje" && (
        <div className="space-y-4">
          {filteredTournaments.length === 0 ? (
            <div className="bg-customWhite rounded-lg shadow p-8 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {tournaments.length === 0
                  ? "Zatím nejsou žádné turnaje"
                  : "Žádné turnaje neodpovídají filtrům"}
              </p>
            </div>
          ) : (
            filteredTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
              >
                {editingId === tournament.id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Editace turnaje #{tournament.id}
                      </span>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <TournamentForm
                      data={editTournament}
                      setData={setEditTournament}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditSubmit(tournament.id);
                      }}
                      onCancel={cancelEdit}
                      isSaving={editSaving}
                      error={editError}
                      previewImg={editPreviewUrl}
                      onImageChange={handleEditImageChange}
                      isEdit={true}
                      types={types}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                        {tournament.id}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {tournament.img_path ? (
                        <img
                          src={`${API}${tournament.img_path}`}
                          alt={tournament.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                          <Trophy size={28} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-lg font-semibold text-gray-800">
                          {tournament.name}
                        </p>
                        {tournament.type_name && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tournament.type_name}
                          </span>
                        )}
                        {(userRole === "admin" || userRole === "trainer") && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tournament.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {tournament.status === "completed"
                              ? "✓ Zveřejněný"
                              : "○ Nezveřejněný"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        {tournament.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {tournament.location}
                          </span>
                        )}
                        {tournament.start_date_raw && (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {formatDate(tournament.start_date_raw)}
                            {tournament.end_date_raw &&
                            tournament.end_date_raw !==
                              tournament.start_date_raw
                              ? ` – ${formatDate(tournament.end_date_raw)}`
                              : ""}
                          </span>
                        )}
                        <>
                          <span
                            className={`flex items-center gap-1 ${getColorClass(
                              tournament.registrable_date_raw,
                            )}`}
                          >
                            <CalendarOff size={13} />
                            <span>registrace do:</span>
                            <span>{tournament.registrable_date_formatted}</span>
                          </span>
                        </>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <div className="flex gap-2 flex-shrink-0 flex-wrap">
                        {userRole === "user" &&
                          (() => {
                            const isRegistered = !!tournament.is_registered;

                            const dnes = new Date();
                            dnes.setHours(0, 0, 0, 0);

                            const uzaverka = new Date(
                              tournament.registrable_date_raw,
                            );
                            uzaverka.setHours(23, 59, 59, 999);

                            const jePoUzaverce = dnes > uzaverka;

                            if (jePoUzaverce) {
                              return (
                                <div className="flex items-center gap-2">
                                  {isRegistered && (
                                    <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium">
                                      ✓ Přihlášen
                                    </span>
                                  )}
                                  <button
                                    disabled
                                    className="bg-gray-50 text-gray-400 border border-gray-200 px-4 py-2 rounded-lg text-sm cursor-not-allowed font-medium"
                                  >
                                    Po uzávěrce
                                  </button>
                                </div>
                              );
                            }

                            if (isRegistered) {
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium">
                                    ✓ Přihlášen
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleUnregister(tournament.id)
                                    }
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 px-3 py-2 rounded-lg text-sm transition-colors font-medium"
                                  >
                                    Odhlásit se
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <button
                                onClick={() => handleRegister(tournament.id)}
                                className="bg-customGreen hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium flex items-center gap-2"
                              >
                                <Plus size={18} />
                                Přihlásit se
                              </button>
                            );
                          })()}

                        {(userRole === "admin" || userRole === "trainer") && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(tournament)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm transition-colors ${
                                tournament.status === "completed"
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                            >
                              {tournament.status === "completed"
                                ? "Skrýt"
                                : "Zveřejnit"}
                            </button>
                            <button
                              onClick={() => startEdit(tournament)}
                              className="editBtn"
                            >
                              <Pencil size={18} />
                              <span>Editovat</span>
                            </button>
                            <button
                              onClick={() => handleDelete(tournament.id)}
                              disabled={deleting === tournament.id}
                              className="deleteBtn"
                            >
                              <Trash2 size={18} />
                              <span>
                                {deleting === tournament.id
                                  ? "Mažu..."
                                  : "Smazat"}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
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
                  Přihlásit závodníka
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
      {activeTab === "prihlasky" && (
        <div className="space-y-4">
          {loadingReg ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Načítám přihlášky...</div>
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-customWhite rounded-lg shadow p-8 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Žádné přihlášky</p>
            </div>
          ) : (
            Object.entries(
              registrations.reduce((acc, reg) => {
                const key = `${reg.tournament_id}__${reg.tournament_name}`;
                if (!acc[key])
                  acc[key] = {
                    fighters: [],
                    tournament_name: reg.tournament_name,
                    tournament_location: reg.tournament_location,
                    tournament_start_date: reg.tournament_start_date,
                    tournament_end_date: reg.tournament_end_date,
                    tournament_img: reg.tournament_img,
                    type_name: reg.type_name,
                  };
                acc[key].fighters.push(reg);
                return acc;
              }, {}),
            ).map(([key, group]) => {
              const [tournamentId] = key.split("__");
              const isExpanded = expandedTournament === tournamentId;

              return (
                <div
                  key={key}
                  className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-shrink-0">
                        {group.tournament_img ? (
                          <img
                            src={`${API}${group.tournament_img}`}
                            alt={group.tournament_name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                            <Trophy size={28} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-lg font-semibold text-gray-800">
                            {group.tournament_name}
                          </p>
                          {group.type_name && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {group.type_name}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            {group.fighters.length}{" "}
                            {group.fighters.length === 1
                              ? "závodník"
                              : group.fighters.length <= 4
                                ? "závodníci"
                                : "závodníků"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          {group.tournament_location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} /> {group.tournament_location}
                            </span>
                          )}
                          {group.tournament_start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={13} />
                              {formatDate(group.tournament_start_date)}
                              {group.tournament_end_date &&
                              group.tournament_end_date !==
                                group.tournament_start_date
                                ? ` – ${formatDate(group.tournament_end_date)}`
                                : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(userRole === "admin" || userRole === "trainer") && (
                          <button
                            onClick={() => {
                              setShowRegisterModal(tournamentId);
                              setSelectedFighter("");
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                          >
                            <Plus size={15} /> Přihlásit závodníka
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setExpandedTournament(
                              isExpanded ? null : tournamentId,
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-customWhite border border-customGreen text-customBlack rounded-lg text-sm transition-colors"
                        >
                          {isExpanded
                            ? "Skrýt závodníky ▲"
                            : "Zobrazit závodníky ▼"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {group.fighters.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                        >
                          <div
                            className="flex items-center gap-3"
                            onClick={() =>
                              navigate(`/zavodnik/${reg.fighter_id}`)
                            }
                          >
                            {reg.fighter_pfp ? (
                              <img
                                src={`${API}${reg.fighter_pfp}`}
                                alt={reg.fighter_name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 cursor-pointer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold cursor-pointer">
                                {reg.fighter_name?.charAt(0)}
                                {reg.fighter_surname?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {reg.fighter_name} {reg.fighter_surname}
                              </p>
                              {reg.fighter_weight && (
                                <p className="text-xs text-gray-400">
                                  {reg.fighter_weight} kg
                                </p>
                              )}
                              {reg.place && (
                                <p className="text-xs text-customBlack font-bold">
                                  {reg.place}. místo{" "}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {editingResult?.regId === reg.id ? (
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="number"
                                  min="1"
                                  max="99"
                                  placeholder="Místo"
                                  value={editingResult.place}
                                  onChange={(e) =>
                                    setEditingResult({
                                      ...editingResult,
                                      place: e.target.value,
                                    })
                                  }
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button
                                  onClick={handleSaveResult}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                                >
                                  Uložit
                                </button>
                                <button
                                  onClick={() => setEditingResult(null)}
                                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs transition-colors"
                                >
                                  Zrušit
                                </button>
                              </div>
                            ) : (
                              (userRole === "admin" ||
                                userRole === "trainer") && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingResult({
                                        regId: reg.id,
                                        place: reg.place || "",
                                      });
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-xs transition-colors"
                                  >
                                    <Pencil size={11} /> Výsledek
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAdminUnregister(reg.id);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs transition-colors"
                                  >
                                    <X size={12} /> Odhlásit
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AdminTurnaje;
