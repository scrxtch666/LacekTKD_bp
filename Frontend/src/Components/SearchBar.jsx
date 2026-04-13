function SearchBar({
  search,
  onSearchChange,
  placeholder = "Hledat...",
  filters = [],
  onClear,
  hasActiveFilter,
}) {
  return (
    <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
      />

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        >
          <option value="">{filter.placeholder}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {filters
        .filter((f) => f.type === "toggle")
        .map((filter) => (
       <button
  key={filter.key}
  onClick={() => filter.onChange(!filter.value)}
  className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
    filter.value
      ? "bg-customGreen text-white border-customGreen"
      : "bg-customWhite text-gray-600 border-gray-300"
  }`}
>
  {filter.label}
</button>
        ))}

      {hasActiveFilter && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-customWhite border border-gray-300 text-gray-600 rounded-lg text-sm transition-colors hover:bg-gray-50"
        >
          Zrušit filtry
        </button>
      )}
    </div>
  );
}

export default SearchBar;