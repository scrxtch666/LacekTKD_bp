import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Trash2,
  UserPlus,
  X,
  Pencil,
  Check,
  Star,
  Eye,
  EyeOff,
  Upload,
  UserX,
  User,
  Trophy,
  Mail,
  Phone,
} from "lucide-react";
import { getUserRole } from "../../utils/auth";
import config from "../../../config";

const API = config.API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function AdminZavodnici() {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [belts, setBelts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterBest, setFilterBest] = useState(false);
  const [filterLegend, setFilterLegend] = useState(false);
  const [filterAccount, setFilterAccount] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFighter, setNewFighter] = useState({
    name: "",
    surname: "",
    birth: "",
    belts_id: "",
    category_id: "",
    actual_weight_category: "",
    best: 0,
    legend: 0,
    active: 1,
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editFighter, setEditFighter] = useState({});
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchFighters();
    fetchBelts();
    fetchCategories();
  }, []);

  const fetchFighters = () => {
    const role = getUserRole();

    const url =
      role === "admin" || role === "trainer"
        ? `${API}/api/fighters/admin`
        : `${API}/api/fighters`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFighters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setFighters([]);
        setLoading(false);
      });
  };

  const fetchBelts = () => {
    fetch(`${API}/api/belts`)
      .then((res) => res.json())
      .then((data) => setBelts(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchCategories = () => {
    fetch(`${API}/api/category`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tohoto závodníka?")) return;
    setDeleting(id);
    try {
      const response = await fetch(`${API}/api/fighters/${id}`, {
        method: "DELETE",
      });
      if (response.ok) setFighters(fighters.filter((f) => f.id !== id));
      else alert("Nepodařilo se smazat závodníka");
    } catch {
      alert("Chyba při mazání závodníka");
    } finally {
      setDeleting(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFighter({ ...newFighter, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!newFighter.name || !newFighter.surname || !newFighter.belts_id) {
      setFormError("Vyplňte všechna povinná pole.");
      return;
    }
    setSaving(true);
    const formData = new FormData();
    Object.entries(newFighter).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val ?? "");
    });
    try {
      const response = await fetch(`${API}/api/fighters`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        cancelAdd();
        fetchFighters();
      } else {
        const err = await response.json();
        setFormError(err.error || "Nepodařilo se přidat závodníka");
      }
    } catch {
      setFormError("Chyba při ukládání závodníka.");
    } finally {
      setSaving(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormError("");
    setPreviewUrl(null);
    setNewFighter({
      name: "",
      surname: "",
      birth: "",
      belts_id: "",
      category_id: "",
      actual_weight_category: "",
      best: 0,
      legend: 0,
      active: 1,
      image: null,
    });
  };

  const startEdit = (fighter) => {
    setEditingId(fighter.id);
    setEditFighter({
      name: fighter.name || "",
      surname: fighter.surname || "",
      birth: fighter.birth ? fighter.birth.substring(0, 10) : "",
      belts_id: fighter.belts_id || "",
      category_id: fighter.category_id || "",
      actual_weight_category: fighter.actual_weight_category || "",
      best: fighter.best || 0,
      legend: fighter.legend || 0,
      active: fighter.active ?? 1,
      image: null,
    });
    setEditPreviewUrl(null);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFighter({});
    setEditPreviewUrl(null);
    setEditError("");
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFighter({ ...editFighter, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setEditPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (id) => {
    setEditError("");
    if (!editFighter.name || !editFighter.surname) {
      setEditError("Jméno a příjmení nesmí být prázdné.");
      return;
    }
    setEditSaving(true);
    const formData = new FormData();
    Object.entries(editFighter).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val ?? "");
    });
    try {
      const response = await fetch(`${API}/api/fighters/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        cancelEdit();
        fetchFighters();
      } else {
        const err = await response.json();
        setEditError(err.error || "Nepodařilo se uložit změny");
      }
    } catch {
      setEditError("Chyba při ukládání závodníka.");
    } finally {
      setEditSaving(false);
    }
  };

  const filteredFighters = fighters.filter((fighter) => {
    const matchesSearch = `${fighter.name} ${fighter.surname}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesBest = !filterBest || fighter.best === 1;
    const matchesLegend = !filterLegend || fighter.legend === 1;
    const matchesAccount =
      filterAccount === "" ||
      (filterAccount === "assigned" && fighter.user_login) ||
      (filterAccount === "unassigned" && !fighter.user_login);
    return matchesSearch && matchesBest && matchesLegend && matchesAccount;
  });

  const hasActiveFilter = search || filterBest || filterLegend || filterAccount;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Načítám závodníky...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">Správa závodníků</div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <UserPlus size={20} />
            <span>Přidat závodníka</span>
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat závodníka..."
          className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        />

        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        >
          <option value="">Všichni závodníci</option>
          <option value="assigned">✅ Přiřazený účet</option>
          <option value="unassigned">❌ Nepřiřazený účet</option>
        </select>

        <button
          onClick={() => setFilterBest(!filterBest)}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterBest ? "bg-customGreen text-white border-customGreen" : "bg-customWhite border-gray-300"}`}
        >
          <Star size={11} />
          Nejlepší
        </button>

        <button
          onClick={() => setFilterLegend(!filterLegend)}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterLegend ? "bg-customGreen text-white border-customGreen" : "bg-customWhite border-gray-300"}`}
        >
          <Trophy size={11} />
          Legenda
        </button>

        {hasActiveFilter && (
          <button
            onClick={() => {
              setSearch("");
              setFilterBest(false);
              setFilterLegend(false);
              setFilterAccount("");
            }}
            className="px-4 py-2 bg-customWhite border border-gray-300 rounded-lg text-sm transition-colors hover:bg-gray-50"
          >
            Zrušit filtry
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Nový závodník
            </h3>
            <button
              onClick={cancelAdd}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Jméno *", "text", "name", "Josef"],
                ["Příjmení *", "text", "surname", "Novák"],
              ].map(([label, type, key, placeholder]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={newFighter[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setNewFighter({ ...newFighter, [key]: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum narození
                </label>
                <input
                  type="date"
                  value={newFighter.birth}
                  onChange={(e) =>
                    setNewFighter({ ...newFighter, birth: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktuální váha (kg)
                </label>
                <input
                  type="number"
                  value={newFighter.actual_weight_category}
                  placeholder="72"
                  onChange={(e) =>
                    setNewFighter({
                      ...newFighter,
                      actual_weight_category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pásek *
                </label>
                <select
                  value={newFighter.belts_id}
                  onChange={(e) =>
                    setNewFighter({ ...newFighter, belts_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Vyber pásek --</option>
                  {belts.map((belt) => (
                    <option key={belt.id} value={belt.id}>
                      {belt.cup || belt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Věková kategorie
                </label>
                <select
                  value={newFighter.category_id}
                  onChange={(e) =>
                    setNewFighter({
                      ...newFighter,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Vyber kategorii --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}: {cat.min} - {cat.max}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                ["active", "Aktivní", "green"],
                ["best", "Nejlepší závodník", "yellow"],
                ["legend", "Legenda", "purple"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!newFighter[key]}
                    onChange={(e) =>
                      setNewFighter({
                        ...newFighter,
                        [key]: e.target.checked ? 1 : 0,
                      })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotka závodníka
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                  <Upload size={18} />
                  <span>Vybrat soubor</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {newFighter.image && (
                  <span className="text-sm text-gray-600">
                    {newFighter.image.name}
                  </span>
                )}
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Náhled"
                  className="mt-2 h-28 w-28 object-cover rounded-full border-2 border-gray-200"
                />
              )}
            </div>
            {formError && (
              <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Ukládám..." : "Přidat závodníka"}
              </button>
              <button
                type="button"
                onClick={cancelAdd}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredFighters.length === 0 ? (
        <div className="bg-customWhite rounded-lg shadow p-8 text-center">
          <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {hasActiveFilter
              ? "Žádný závodník neodpovídá filtrům"
              : "Zatím nejsou žádní závodníci"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFighters.map((fighter) => (
            <div
              key={fighter.id}
              className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
            >
              {editingId === fighter.id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Editace závodníka #{fighter.id}
                    </span>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ["Jméno *", "text", "name"],
                      ["Příjmení *", "text", "surname"],
                    ].map(([label, type, key]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {label}
                        </label>
                        <input
                          type={type}
                          value={editFighter[key]}
                          onChange={(e) =>
                            setEditFighter({
                              ...editFighter,
                              [key]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Datum narození
                      </label>
                      <input
                        type="date"
                        value={editFighter.birth}
                        onChange={(e) =>
                          setEditFighter({
                            ...editFighter,
                            birth: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Aktuální váha (kg)
                      </label>
                      <input
                        type="number"
                        value={editFighter.actual_weight_category}
                        onChange={(e) =>
                          setEditFighter({
                            ...editFighter,
                            actual_weight_category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pásek *
                      </label>
                      <select
                        value={editFighter.belts_id}
                        onChange={(e) =>
                          setEditFighter({
                            ...editFighter,
                            belts_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Vyber pásek --</option>
                        {belts.map((belt) => (
                          <option key={belt.id} value={belt.id}>
                            {belt.cup || belt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Věková kategorie
                      </label>
                      <select
                        value={editFighter.category_id}
                        onChange={(e) =>
                          setEditFighter({
                            ...editFighter,
                            category_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Vyber kategorii --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.category_name || cat.name}: {cat.min} -{" "}
                            {cat.max}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {[
                      ["active", "Aktivní"],
                      ["best", "Nejlepší závodník"],
                      ["legend", "Legenda"],
                    ].map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!editFighter[key]}
                          onChange={(e) =>
                            setEditFighter({
                              ...editFighter,
                              [key]: e.target.checked ? 1 : 0,
                            })
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nová fotka{" "}
                      <span className="text-gray-400">(nepovinné)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm">
                        <Upload size={16} />
                        <span>Vybrat soubor</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="hidden"
                        />
                      </label>
                      {editFighter.image && (
                        <span className="text-sm text-gray-600">
                          {editFighter.image.name}
                        </span>
                      )}
                    </div>
                    {editPreviewUrl && (
                      <img
                        src={editPreviewUrl}
                        alt="Náhled"
                        className="mt-2 h-24 w-24 object-cover rounded-full border-2 border-gray-200"
                      />
                    )}
                  </div>
                  {editError && (
                    <div className="px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                      {editError}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleEditSubmit(fighter.id)}
                      disabled={editSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      <Check size={16} />
                      {editSaving ? "Ukládám..." : "Uložit změny"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      Zrušit
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => navigate(`/zavodnik/${fighter.id}`)}
                  className="flex flex-col sm:flex-row items-center gap-4"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold flex-shrink-0">
                    {fighter.id}
                  </span>
                  <div className="flex-shrink-0">
                    {fighter.img_path ? (
                      <img
                        src={`${API}${fighter.img_path}`}
                        alt={fighter.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 noPfp">
                        {fighter.name?.charAt(0).toUpperCase() || "Z"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-lg font-semibold text-gray-800">
                      {fighter.name} {fighter.surname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {fighter.birth
                        ? new Date(fighter.birth).toLocaleDateString("cs-CZ")
                        : "Datum narození neznámé"}
                      {fighter.actual_weight_category
                        ? ` · ${fighter.actual_weight_category} kg`
                        : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${fighter.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                      >
                        {fighter.active ? (
                          <Eye size={11} className="mr-1" />
                        ) : (
                          <EyeOff size={11} className="mr-1" />
                        )}
                        {fighter.active ? "Aktivní" : "Neaktivní"}
                      </span>
                      {!!fighter.best && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star size={11} />
                          Nejlepší
                        </span>
                      )}
                      {!!fighter.legend && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Trophy size={11} />
                          Legenda
                        </span>
                      )}
                      {fighter.user_login ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <User size={11} />
                          {fighter.user_login}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <UserX size={11} />
                          Nepřiřazený účet
                        </span>
                      )}
                    </div>
                    {fighter.user_login &&
                      (fighter.user_email || fighter.user_phone) && (
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1 justify-center sm:justify-start">
                          {fighter.user_email && (
                            <>
                              <Mail size={14} />
                              <span>{fighter.user_email}</span>
                            </>
                          )}
                          {fighter.user_phone && (
                            <>
                              <Phone size={14} />
                              <span>{fighter.user_phone}</span>
                            </>
                          )}
                        </div>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(fighter);
                      }}
                      className="editBtn"
                    >
                      <Pencil size={18} />
                      <span>Editovat</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(fighter.id);
                      }}
                      disabled={deleting === fighter.id}
                      className="deleteBtn"
                    >
                      <Trash2 size={18} />
                      <span>
                        {deleting === fighter.id ? "Mažu..." : "Smazat"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminZavodnici;
