import React, { useState, useEffect } from "react";
import {
  Trash2,
  Image as ImageIcon,
  Plus,
  Upload,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import config from "../../../config";
const API = config.API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function AdminBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    name: "",
    image: null,
    active: true,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = () => {
    fetch(`${API}/api/banner`)
      .then((response) => response.json())
      .then((data) => {
        setBanners(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
        setBanners([]);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tento banner?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`${API}/api/banner/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });

      if (response.ok) {
        setBanners(banners.filter((banner) => banner.id !== id));
      } else {
        alert("Nepodařilo se smazat banner");
      }
    } catch (error) {
      console.error("Chyba při mazání:", error);
      alert("Chyba při mazání banneru");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    setToggling(id);
    try {
      const response = await fetch(`${API}/api/banner/${id}/toggle`, {
        method: "PATCH",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        setBanners(
          banners.map((banner) =>
            banner.id === id ? { ...banner, active: !currentActive } : banner,
          ),
        );
      } else {
        alert("Nepodařilo se změnit stav banneru");
      }
    } catch (error) {
      console.error("Chyba při změně stavu:", error);
      alert("Chyba při změně stavu banneru");
    } finally {
      setToggling(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBanner({ ...newBanner, image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newBanner.name || !newBanner.image) {
      alert("Vyplňte prosím název a vyberte obrázek");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("banner_name", newBanner.name);
    formData.append("image", newBanner.image);
    formData.append("active", newBanner.active ? "1" : "0");

    try {
      const response = await fetch(`${API}/api/banner`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Banner byl úspěšně přidán!");

        // Reset formuláře
        setNewBanner({ name: "", image: null, active: true });
        setPreviewUrl(null);
        setShowAddForm(false);

        fetchBanners();
      } else {
        const error = await response.json();
        alert("Chyba: " + (error.error || "Nepodařilo se přidat banner"));
      }
    } catch (error) {
      console.error("Chyba při nahrávání:", error);
      alert("Chyba při nahrávání banneru");
    } finally {
      setUploading(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setNewBanner({ name: "", image: null, active: true });
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám bannery...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">Správa bannerů</div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Přidat banner</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Nový banner</h3>
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
                Název banneru
              </label>
              <input
                type="text"
                value={newBanner.name}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Např. Hlavní banner 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obrázek
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
                {newBanner.image && (
                  <span className="text-sm text-gray-600">
                    {newBanner.image.name}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBanner.active}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, active: e.target.checked })
                  }
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Banner aktivní (zobrazovat na webu)
                </span>
              </label>
            </div>

            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Náhled
                </label>
                <img
                  src={previewUrl}
                  alt="Náhled"
                  className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Nahrávám..." : "Přidat banner"}
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

      {!banners.length ? (
        <div className="bg-customWhite rounded-lg shadow p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Zatím nejsou žádné bannery</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 ${
                !banner.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold">
                    {banner.id}
                  </span>
                </div>

                <div className="flex-shrink-0 relative">
                  <img
                    src={`${API}${banner.img_path}`}
                    alt={banner.banner_name}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  {!banner.active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <EyeOff className="text-white" size={32} />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Název banneru</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {banner.banner_name}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        banner.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {banner.active ? "Aktivní" : "Neaktivní"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleToggleActive(banner.id, banner.active)}
                    disabled={toggling === banner.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      banner.active
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {banner.active ? <EyeOff size={18} /> : <Eye size={18} />}
                    <span>
                      {toggling === banner.id
                        ? "..."
                        : banner.active
                          ? "Skrýt"
                          : "Zobrazit"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(banner.id)}
                    disabled={deleting === banner.id}
                    className="deleteBtn disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                    <span>{deleting === banner.id ? "Mažu..." : "Smazat"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminBanner;
