function TournamentFilters({
  search,
  onSearchChange,
  filterTournament,
  onFilterTournamentChange,
  filterActual,
  onFilterActualChange,
  filterOld,
  onFilterOldChange,
  isAdminOrTrainer,
}) {
  const hasActiveFilter =
    search || filterActual || filterOld || filterTournament;

  return (
    <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Hledat turnaj..."
        className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
      />

      {isAdminOrTrainer && (
        <select
          value={filterTournament}
          onChange={(e) => onFilterTournamentChange(e.target.value)}
          className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        >
          <option value="">Všechny turnaje</option>
          <option value="completed">✅ Zveřejněné</option>
          <option value="uncompleted">❌ Nezveřejněné</option>
        </select>
      )}

      {[
        {
          label: "Aktuální",
          value: filterActual,
          onChange: onFilterActualChange,
        },
        { label: "Staré", value: filterOld, onChange: onFilterOldChange },
      ].map(({ label, value, onChange }) => (
        <button
          key={label}
          onClick={() => onChange(!value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value
              ? "bg-customGreen text-white border-customGreen"
              : "bg-customWhite border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}

      {hasActiveFilter && (
        <button
          onClick={() => {
            onSearchChange("");
            onFilterActualChange(false);
            onFilterOldChange(false);
            onFilterTournamentChange("");
          }}
          className="px-4 py-2 bg-customWhite border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Zrušit filtry
        </button>
      )}
    </div>
  );
}

export default TournamentFilters;
