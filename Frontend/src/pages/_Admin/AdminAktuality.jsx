import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Trash2,
  Plus,
  X,
  Pencil,
  Newspaper,
  Calendar,
  Eye,
  EyeOff,
  Images,
  ImagePlus,
} from "lucide-react";
import config from "../../../config";
const API = config.API_URL;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const EventForm = ({
  data,
  setData,
  onSubmit,
  onCancel,
  isSaving,
  error,
  onPhotosChange,
  newPhotoPreviews,
  onCoverChange,
  coverPreview,
  existingCoverUrl,
  isEdit,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Název *
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Název aktuality"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Datum *
        </label>
        <input
          type="date"
          value={data.date_start}
          onChange={(e) => setData({ ...data, date_start: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
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
          <option value="Availible">Dostupná</option>
          <option value="Hidden">Skrytá</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text aktuality *
        </label>
        <textarea
          value={data.body}
          rows={5}
          onChange={(e) => setData({ ...data, body: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          placeholder="Text aktuality..."
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Náhledová fotka{" "}
        {isEdit && (
          <span className="text-gray-400 font-normal">
            (nepovinné – ponechá stávající)
          </span>
        )}
      </label>

      {existingCoverUrl && !coverPreview && (
        <div className="mb-2">
          <p className="text-xs text-gray-400 mb-1">
            Převzatý obrázek z turnaje:
          </p>
          <img
            src={existingCoverUrl}
            alt="Cover z turnaje"
            className="h-28 object-contain rounded-lg border border-green-200 border-2"
          />
        </div>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm">
        <ImagePlus size={16} />
        <span>
          {existingCoverUrl && !coverPreview
            ? "Vybrat jiný obrázek"
            : "Vybrat náhledovou fotku"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={onCoverChange}
          className="hidden"
        />
      </label>
      {coverPreview && (
        <img
          src={coverPreview}
          alt="Náhled cover"
          className="mt-2 h-28 object-contain rounded-lg border border-gray-200"
        />
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fotky{" "}
        {isEdit && (
          <span className="text-gray-400 font-normal">
            (přidá k stávajícím)
          </span>
        )}
        {!isEdit && (
          <span className="text-gray-400 font-normal">(nepovinné, max 10)</span>
        )}
      </label>
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm">
        <ImagePlus size={16} />
        <span>Vybrat fotky galerie</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPhotosChange}
          className="hidden"
        />
      </label>

      {newPhotoPreviews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {newPhotoPreviews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-20 w-20 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
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
        {isSaving ? "Ukládám..." : isEdit ? "Uložit změny" : "Přidat aktualitu"}
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

const PhotoGallery = ({ photos, onDeletePhoto }) => {
  const [lightbox, setLightbox] = useState(null);

  if (!photos.length)
    return <p className="text-xs text-gray-400 italic">Žádné fotky</p>;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={`${API}${photo.img_path}`}
              alt=""
              onClick={() => setLightbox(`${API}${photo.img_path}`)}
              className="h-16 w-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
            />
            <button
              onClick={() => onDeletePhoto(photo.id)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

function AdminAktuality() {
  const location = useLocation();
  const prefill = location.state?.prefill || null;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    body: "",
    date_start: "",
    status: "Availible",
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const [newCover, setNewCover] = useState(null);
  const [newCoverPreview, setNewCoverPreview] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editEvent, setEditEvent] = useState({});
  const [editPhotos, setEditPhotos] = useState([]);
  const [editPhotoPreviews, setEditPhotoPreviews] = useState([]);
  const [editCover, setEditCover] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (prefill) {
      setNewEvent({
        title: prefill.title || "",
        body: prefill.body || "",
        date_start: prefill.date_start || "",
        status: prefill.status || "Availible",
      });
      if (prefill.existingCoverUrl) {
        setExistingCoverUrl(prefill.existingCoverUrl);
      }
      setShowAddForm(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    fetch(`${API}/api/events/admin`, {
      headers: authHeader(),
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  };

  const validateForm = (data, setError) => {
    if (!data.title) {
      setError("Vyplňte prosím název aktuality.");
      return false;
    }
    if (!data.body) {
      setError("Vyplňte prosím text aktuality.");
      return false;
    }
    if (!data.date_start) {
      setError("Vyplňte prosím datum.");
      return false;
    }
    return true;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCover(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos(files);
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length)
          setNewPhotoPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm(newEvent, setFormError)) return;

    setSaving(true);
    const formData = new FormData();
    formData.append("title", newEvent.title);
    formData.append("body", newEvent.body);
    formData.append("date_start", newEvent.date_start);
    formData.append("status", newEvent.status);

    if (newCover) {
      formData.append("cover", newCover);
    } else if (existingCoverUrl) {
      formData.append("cover_url", existingCoverUrl);
    }

    newPhotos.forEach((file) => formData.append("photos", file));

    try {
      const response = await fetch(`${API}/api/events`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });
      if (response.ok) {
        cancelAdd();
        fetchEvents();
      } else {
        const err = await response.json();
        setFormError(
          "Chyba: " + (err.error || "Nepodařilo se přidat aktualitu"),
        );
      }
    } catch {
      setFormError("Chyba při ukládání aktuality.");
    } finally {
      setSaving(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormError("");
    setNewPhotos([]);
    setNewPhotoPreviews([]);
    setNewCover(null);
    setNewCoverPreview(null);
    setExistingCoverUrl(null);
    setNewEvent({ title: "", body: "", date_start: "", status: "Availible" });
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditEvent({
      title: event.title || "",
      body: event.body || "",
      date_start: event.date_start_raw?.substring(0, 10) || "",
      status: event.status || "Availible",
    });
    setEditPhotos([]);
    setEditPhotoPreviews([]);
    setEditCover(null);
    setEditCoverPreview(null);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEvent({});
    setEditPhotos([]);
    setEditPhotoPreviews([]);
    setEditCover(null);
    setEditCoverPreview(null);
    setEditError("");
  };

  const handleEditCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCover(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setEditPhotos(files);
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length)
          setEditPhotoPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditSubmit = async (id) => {
    setEditError("");
    if (!validateForm(editEvent, setEditError)) return;

    setEditSaving(true);
    const formData = new FormData();
    formData.append("title", editEvent.title);
    formData.append("body", editEvent.body);
    formData.append("date_start", editEvent.date_start);
    formData.append("status", editEvent.status);
    if (editCover) formData.append("cover", editCover);
    editPhotos.forEach((file) => formData.append("photos", file));

    try {
      const response = await fetch(`${API}/api/events/${id}`, {
        method: "PUT",
        headers: authHeader(),
        body: formData,
      });
      if (response.ok) {
        cancelEdit();
        fetchEvents();
      } else {
        const err = await response.json();
        setEditError("Chyba: " + (err.error || "Nepodařilo se uložit změny"));
      }
    } catch {
      setEditError("Chyba při ukládání aktuality.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tuto aktualitu včetně všech fotek?"))
      return;
    setDeleting(id);
    try {
      const response = await fetch(`${API}/api/events/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (response.ok) setEvents(events.filter((e) => e.id !== id));
      else alert("Nepodařilo se smazat aktualitu");
    } catch {
      alert("Chyba při mazání aktuality");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeletePhoto = async (photoId, eventId) => {
    if (!confirm("Smazat tuto fotku?")) return;
    try {
      const response = await fetch(`${API}/api/events/photo/${photoId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (response.ok) {
        setEvents(
          events.map((e) =>
            e.id === eventId
              ? { ...e, photos: e.photos.filter((p) => p.id !== photoId) }
              : e,
          ),
        );
      } else {
        alert("Nepodařilo se smazat fotku");
      }
    } catch {
      alert("Chyba při mazání fotky");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám aktuality...</div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">Správa aktualit</div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Přidat aktualitu</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Nová aktualita
              </h3>
              {prefill && (
                <p className="text-sm text-purple-600 mt-1 flex items-center gap-1">
                  <Newspaper size={14} />
                  Předvyplněno z turnaje – zkontroluj a doplň text
                </p>
              )}
            </div>
            <button
              onClick={cancelAdd}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <EventForm
            data={newEvent}
            setData={setNewEvent}
            onSubmit={handleSubmit}
            onCancel={cancelAdd}
            isSaving={saving}
            error={formError}
            onPhotosChange={handlePhotosChange}
            newPhotoPreviews={newPhotoPreviews}
            onCoverChange={handleCoverChange}
            coverPreview={newCoverPreview}
            existingCoverUrl={existingCoverUrl}
            isEdit={false}
          />
        </div>
      )}

      {!events.length ? (
        <div className="bg-customWhite rounded-lg shadow p-8 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Zatím nejsou žádné aktuality</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
            >
              {editingId === event.id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      Editace aktuality #{event.id}
                    </span>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {event.cover_photo && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Stávající náhledová fotka
                      </p>
                      <img
                        src={`${API}${event.cover_photo}`}
                        alt="Cover"
                        className="h-24 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {event.photos?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Images size={15} /> Stávající fotky galerie
                      </p>
                      <PhotoGallery
                        photos={event.photos}
                        onDeletePhoto={(photoId) =>
                          handleDeletePhoto(photoId, event.id)
                        }
                      />
                    </div>
                  )}

                  <EventForm
                    data={editEvent}
                    setData={setEditEvent}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditSubmit(event.id);
                    }}
                    onCancel={cancelEdit}
                    isSaving={editSaving}
                    error={editError}
                    onPhotosChange={handleEditPhotosChange}
                    newPhotoPreviews={editPhotoPreviews}
                    onCoverChange={handleEditCoverChange}
                    coverPreview={editCoverPreview}
                    existingCoverUrl={null}
                    isEdit={true}
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    {event.cover_photo ? (
                      <img
                        src={`${API}${event.cover_photo}`}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-green-100 text-green-800 font-semibold text-sm">
                        #{event.id}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-lg font-semibold text-gray-800">
                        {event.title}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.status === "Availible"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {event.status === "Availible" ? (
                          <>
                            <Eye size={11} /> Dostupná
                          </>
                        ) : (
                          <>
                            <EyeOff size={11} /> Skrytá
                          </>
                        )}
                      </span>
                      {event.author && (
                        <span className="text-xs text-gray-400">
                          od {event.author}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <Calendar size={13} />
                      <span>{event.date_start}</span>
                    </div>

                    {event.body && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {event.body}
                      </p>
                    )}

                    <div>
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Images size={12} />
                        {event.photos?.length || 0}{" "}
                        {event.photos?.length === 1
                          ? "fotka"
                          : event.photos?.length >= 2 &&
                              event.photos?.length <= 4
                            ? "fotky"
                            : "fotek"}
                      </p>
                      <PhotoGallery
                        photos={event.photos || []}
                        onDeletePhoto={(photoId) =>
                          handleDeletePhoto(photoId, event.id)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(event)}
                      className="editBtn"
                    >
                      <Pencil size={18} />
                      <span>Editovat</span>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deleting === event.id}
                      className="deleteBtn"
                    >
                      <Trash2 size={18} />
                      <span>
                        {deleting === event.id ? "Mažu..." : "Smazat"}
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

export default AdminAktuality;
