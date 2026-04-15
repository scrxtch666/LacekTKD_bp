import { useState } from "react";
import { Upload, X } from "lucide-react";

const EMPTY = {
  name: "",
  location: "",
  price: "",
  type_id: "",
  status: "completed",
  start_date: "",
  end_date: "",
  registrable_date: "",
  info: "",
  image: null,
};

function TournamentForm({
  types,
  API,
  onSuccess,
  onCancel,
  initialData = null,
}) {
  const isEdit = !!initialData;
  const [data, setData] = useState(initialData || EMPTY);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!data.name) return (setError("Vyplňte název."), false);
    if (!data.location) return (setError("Vyplňte místo konání."), false);
    if (!data.price) return (setError("Vyplňte cenu."), false);
    if (!data.type_id) return (setError("Vyberte typ."), false);
    if (!data.start_date) return (setError("Vyplňte datum začátku."), false);
    if (!data.registrable_date) return (setError("Vyplňte uzávěrku."), false);
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData({ ...data, image: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val || "");
    });

    const url = isEdit
      ? `${API}/api/tournaments/${initialData.id}`
      : `${API}/api/tournaments`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData, headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        } });
      if (res.ok) onSuccess();
      else {
        const d = await res.json();
        setError(d.error || "Chyba při ukládání");
      }
    } catch {
      setError("Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      label: "Název turnaje *",
      key: "name",
      type: "text",
      span: 2,
      placeholder: "Bratislava Open 2026",
    },
    {
      label: "Místo konání *",
      key: "location",
      type: "text",
      placeholder: "Praha",
    },
    { label: "Cena (Kč) *", key: "price", type: "number", placeholder: "500" },
    { label: "Datum začátku *", key: "start_date", type: "date" },
    { label: "Datum konce", key: "end_date", type: "date" },
    { label: "Uzávěrka přihlášek *", key: "registrable_date", type: "date" },
  ];

  return (
    <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {isEdit ? `Editace turnaje #${initialData.id}` : "Nový turnaj"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ label, key, type, span, placeholder }) => (
            <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={data[key]}
                placeholder={placeholder}
                onChange={(e) => setData({ ...data, [key]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ *
            </label>
            <select
              value={data.type_id}
              onChange={(e) => setData({ ...data, type_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="completed">Aktivní (zobrazena na webu)</option>
              <option value="uncompleted">Skrytá</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Popis / info
            </label>
            <textarea
              value={data.info}
              rows={3}
              onChange={(e) => setData({ ...data, info: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
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
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm w-fit">
            <Upload size={16} />
            <span>Vybrat soubor</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {preview && (
            <img
              src={preview}
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
            disabled={saving}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Ukládám..." : isEdit ? "Uložit změny" : "Přidat turnaj"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}

export default TournamentForm;
