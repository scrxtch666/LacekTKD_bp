import { useState } from "react";
import { Upload, X } from "lucide-react";

const EMPTY = {
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
};

function FighterAddForm({ belts, categories, API, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.surname || !form.belts_id)
      return setError("Vyplňte všechna povinná pole.");
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val ?? "");
    });

    try {
      const res = await fetch(`${API}/api/fighters`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) onSuccess();
      else {
        const d = await res.json();
        setError(d.error || "Nepodařilo se přidat závodníka");
      }
    } catch {
      setError("Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-customWhite rounded-lg shadow-lg p-6 border-2 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Nový závodník</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: "Jméno *",
              key: "name",
              type: "text",
              placeholder: "Josef",
            },
            {
              label: "Příjmení *",
              key: "surname",
              type: "text",
              placeholder: "Novák",
            },
            { label: "Datum narození", key: "birth", type: "date" },
            {
              label: "Aktuální váha (kg)",
              key: "actual_weight_category",
              type: "number",
              placeholder: "72",
            },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pásek *
            </label>
            <select
              value={form.belts_id}
              onChange={(e) => setForm({ ...form, belts_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Vyber pásek --</option>
              {belts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.cup || b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Věková kategorie
            </label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Vyber kategorii --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}: {c.min} - {c.max}
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
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.checked ? 1 : 0 })
                }
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotka závodníka
          </label>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer w-fit">
            <Upload size={18} />
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
              className="mt-2 h-28 w-28 object-cover rounded-full border-2 border-gray-200"
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
            {saving ? "Ukládám..." : "Přidat závodníka"}
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

export default FighterAddForm;
