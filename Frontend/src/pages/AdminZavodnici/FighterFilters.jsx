import { Star, Trophy } from "lucide-react";

function FighterFilters({
  search,
  onSearchChange,
  filterAccount,
  onFilterAccountChange,
  filterBest,
  onFilterBestChange,
  filterLegend,
  onFilterLegendChange,
}) {
  const hasActiveFilter = search || filterBest || filterLegend || filterAccount;

  return (
    <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Hledat závodníka..."
        className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
      />

      <select
        value={filterAccount}
        onChange={(e) => onFilterAccountChange(e.target.value)}
        className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
      >
        <option value="">Všichni závodníci</option>
        <option value="assigned">✅ Přiřazený účet</option>
        <option value="unassigned">❌ Nepřiřazený účet</option>
      </select>

      {[
        {
          label: "Nejlepší",
          value: filterBest,
          onChange: onFilterBestChange,
          icon: <Star size={11} />,
        },
        {
          label: "Legenda",
          value: filterLegend,
          onChange: onFilterLegendChange,
          icon: <Trophy size={11} />,
        },
      ].map(({ label, value, onChange, icon }) => (
        <button
          key={label}
          onClick={() => onChange(!value)}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value
              ? "bg-customGreen text-white border-customGreen"
              : "bg-customWhite border-gray-300"
          }`}
        >
          {icon}
          {label}
        </button>
      ))}

      {hasActiveFilter && (
        <button
          onClick={() => {
            onSearchChange("");
            onFilterBestChange(false);
            onFilterLegendChange(false);
            onFilterAccountChange("");
          }}
          className="px-4 py-2 bg-customWhite border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Zrušit filtry
        </button>
      )}
    </div>
  );
}

export default FighterFilters;
