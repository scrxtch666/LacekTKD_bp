function SearchBar({ search, setSearch, selectedPeriod, setSelectedPeriod, periods }) {
  return (
    <div className="flex gap-3 flex-col sm:flex-row">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Hledat aktualitu..."
        className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
      />
      <select
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
      >
        <option value="">Všechna období</option>
        {periods.map((period) => (
          <option key={period} value={period}>{period}</option>
        ))}
      </select>

      {(search || selectedPeriod) && (
        <button
          onClick={() => { setSearch(""); setSelectedPeriod(""); }}
          className="bg-customWhite px-4 py-2 rounded-lg transition-colors"
        >
          Zrušit filtry
        </button>
      )}
    </div>
  );
}

export default SearchBar;