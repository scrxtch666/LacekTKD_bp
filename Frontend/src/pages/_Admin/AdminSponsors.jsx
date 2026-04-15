import React, { useState, useEffect } from "react";
import {
  Trash2,
  Image as ImageIcon,
  Plus,
  Upload,
  X,
  Pencil,
  Check,
} from "lucide-react";
import config from "../../../config";

function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    name: "",
    url: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", url: "", image: null });
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const API = config.API_URL;
  const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

  const fetchSponsors = () => {
    fetch(`${API}/api/sponsors`)
      .then((res) => res.json())
      .then((data) => {
        setSponsors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Chyba při načítání dat:", err);
        setSponsors([]);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tohoto sponzora?")) return;
    setDeleting(id);
    try {
      const response = await fetch(`${API}/api/sponsors/` + id, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (response.ok) {
        setSponsors(sponsors.filter((s) => s.id !== id));
      } else {
        alert("Nepodařilo se smazat sponzora");
      }
    } catch (err) {
      alert("Chyba při mazání sponzora");
    } finally {
      setDeleting(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSponsor({ ...newSponsor, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSponsor.name || !newSponsor.image) {
      alert("Vyplňte prosím název a vyberte obrázek");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("sponsor_name", newSponsor.name);
    formData.append("url", newSponsor.url);
    formData.append("image", newSponsor.image);
    try {
      const response = await fetch(`${API}/api/sponsors`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });
      if (response.ok) {
        alert("Sponzor byl úspěšně přidán!");
        setNewSponsor({ name: "", url: "", image: null });
        setPreviewUrl(null);
        setShowAddForm(false);
        fetchSponsors();
      } else {
        const error = await response.json();
        alert("Chyba: " + (error.error || "Nepodařilo se přidat sponzora"));
      }
    } catch (err) {
      alert("Chyba při nahrávání sponzora");
    } finally {
      setUploading(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setNewSponsor({ name: "", url: "", image: null });
    setPreviewUrl(null);
  };

  const startEdit = (sponsor) => {
    setEditingId(sponsor.id);
    setEditData({
      name: sponsor.sponsor_name,
      url: sponsor.url || "",
      image: null,
    });
    setEditPreviewUrl(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", url: "", image: null });
    setEditPreviewUrl(null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({ ...editData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setEditPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (id) => {
    if (!editData.name) {
      alert("Název nesmí být prázdný");
      return;
    }
    setSaving(true);
    const formData = new FormData();
    formData.append("sponsor_name", editData.name);
    formData.append("url", editData.url);
    if (editData.image) {
      formData.append("image", editData.image);
    }
    try {
      const response = await fetch(`${API}/api/sponsors/` + id, {
        method: "PUT",
        headers: authHeader(),
        body: formData,
      });
      if (response.ok) {
        fetchSponsors();
        cancelEdit();
      } else {
        const error = await response.json();
        alert("Chyba: " + (error.error || "Nepodařilo se upravit sponzora"));
      }
    } catch (err) {
      alert("Chyba při ukládání sponzora");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám sponzory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">Správa sponzorů</div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Přidat sponzora</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Nový sponzor
            </h3>
            <button
              onClick={cancelAdd}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název sponzora
              </label>
              <input
                type="text"
                value={newSponsor.name}
                onChange={(e) =>
                  setNewSponsor({ ...newSponsor, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Např. Firma s.r.o."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Web sponzora (URL)
              </label>
              <input
                type="url"
                value={newSponsor.url}
                onChange={(e) =>
                  setNewSponsor({ ...newSponsor, url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://www.firma.cz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo sponzora
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                  <Upload size={20} />
                  <span>Vybrat soubor</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {newSponsor.image && (
                  <span className="text-sm text-gray-600">
                    {newSponsor.image.name}
                  </span>
                )}
              </div>
            </div>
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Náhled loga
                </label>
                <img
                  src={previewUrl}
                  alt="Náhled"
                  className="h-24 object-contain rounded-lg border-2 border-gray-200 p-2 bg-gray-50"
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Nahrávám..." : "Přidat sponzora"}
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

      {!sponsors.length ? (
        <div className="bg-customWhite rounded-lg shadow p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Zatím nejsou žádní sponzoři</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
            >
              {editingId === sponsor.id ? (
                /* --- EDIT FORMULÁŘ --- */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-700">
                      Upravit sponzora #{sponsor.id}
                    </p>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název
                      </label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={editData.url}
                        onChange={(e) =>
                          setEditData({ ...editData, url: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://www.firma.cz"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nové logo{" "}
                      <span className="text-gray-400 font-normal">
                        (nepovinné – ponechá stávající)
                      </span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                        <Upload size={18} />
                        <span>Vybrat soubor</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="hidden"
                        />
                      </label>
                      {editData.image && (
                        <span className="text-sm text-gray-600">
                          {editData.image.name}
                        </span>
                      )}
                    </div>
                    {editPreviewUrl && (
                      <img
                        src={editPreviewUrl}
                        alt="Náhled"
                        className="mt-2 h-20 object-contain rounded-lg border-2 border-gray-200 p-2 bg-gray-50"
                      />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditSubmit(sponsor.id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={18} />
                      <span>{saving ? "Ukládám..." : "Uložit"}</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Zrušit
                    </button>
                  </div>
                </div>
              ) : (
                /* --- ZOBRAZENÍ --- */
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold">
                      {sponsor.id}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={`${API}${sponsor.img_path}`}
                      alt={sponsor.sponsor_name}
                      className="w-32 h-20 object-contain rounded-lg border-2 border-gray-200 p-1 bg-gray-50"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-gray-500 mb-1">Název sponzora</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {sponsor.sponsor_name}
                    </p>
                    {sponsor.url && (
                      <a
                        href={sponsor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline mt-1 inline-block"
                      >
                        {sponsor.url}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(sponsor)}
                      className="editBtn"
                    >
                      <Pencil size={18} />
                      <span>Upravit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      disabled={deleting === sponsor.id}
                      className="deleteBtn disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                      <span>
                        {deleting === sponsor.id ? "Mažu..." : "Smazat"}
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

export default AdminSponsors;
