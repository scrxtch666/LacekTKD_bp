import { useState } from "react";
import { Upload, X, Check } from "lucide-react";

function FighterEditForm({
  fighter,
  belts,
  categories,
  API,
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState({
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

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.surname)
      return setError("Jméno a příjmení nesmí být prázdné.");
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "image" && val) formData.append("image", val);
      else if (key !== "image") formData.append(key, val ?? "");
    });

    try {
      const res = await fetch(`${API}/api/fighters/${fighter.id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) onSuccess();
      else {
        const d = await res.json();
        setError(d.error || "Nepodařilo se uložit změny");
      }
    } catch {
      setError("Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">
          Editace závodníka #{fighter.id}
        </span>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Jméno *", key: "name", type: "text" },
          { label: "Příjmení *", key: "surname", type: "text" },
          { label: "Datum narození", key: "birth", type: "date" },
          {
            label: "Aktuální váha (kg)",
            key: "actual_weight_category",
            type: "number",
          },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Pásek *
          </label>
          <select
            value={form.belts_id}
            onChange={(e) => setForm({ ...form, belts_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Věková kategorie
          </label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Vyber kategorii --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name || c.name}: {c.min} - {c.max}
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
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nová fotka <span className="text-gray-400">(nepovinné)</span>
        </label>
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm w-fit">
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
            className="mt-2 h-24 w-24 object-cover rounded-full border-2 border-gray-200"
          />
        )}
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
        >
          <Check size={16} />
          {saving ? "Ukládám..." : "Uložit změny"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}

export default FighterEditForm;
