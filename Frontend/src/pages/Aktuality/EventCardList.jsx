import React, { useState, useEffect } from "react";
import EventCardSingle from "./EventCardSingle";
import SearchBar from "../../Components/SearchBar";
import config from "../../../config";

const API = config.API_URL;

const EventCardList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  useEffect(() => {
    fetch(`${API}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        setNews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Načítám data...</div>;

  const periods = [
    ...new Set(
      news.map((event) => {
        const d = new Date(event.date_start_raw);
        return `${d.toLocaleString("cs-CZ", { month: "long" })} ${d.getFullYear()}`;
      }),
    ),
  ].sort((a, b) => b.localeCompare(a));

  const filtered = news.filter((event) => {
    const matchesSearch = event.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const d = new Date(event.date_start_raw);
    const period = `${d.toLocaleString("cs-CZ", { month: "long" })} ${d.getFullYear()}`;
    const matchesPeriod = selectedPeriod === "" || period === selectedPeriod;
    return matchesSearch && matchesPeriod;
  });

  const groups = filtered.reduce((acc, event) => {
    const d = new Date(event.date_start_raw);
    const year = `${d.toLocaleString("cs-CZ", { month: "long" })} ${d.getFullYear()}`;
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});

  const sortedGroups = Object.entries(groups).sort(([a], [b]) =>
    b.localeCompare(a),
  );

  return (
    <div className="space-y-8">
      <SearchBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Hledat aktualitu..."
        hasActiveFilter={!!(search || selectedPeriod)}
        onClear={() => {
          setSearch("");
          setSelectedPeriod("");
        }}
        filters={[
          {
            key: "period",
            value: selectedPeriod,
            onChange: setSelectedPeriod,
            placeholder: "Všechna období",
            options: periods.map((p) => ({ value: p, label: p })),
          },
        ]}
      />

      {sortedGroups.length === 0 && (
        <p className="text-gray-400 text-center italic py-8">
          Žádná aktualita neodpovídá zadaným filtrům
        </p>
      )}

      {sortedGroups.map(([period, events]) => (
        <div key={period}>
          <div className="devider flex justify-between mb-4">
            <span>{period}</span>
            <span className="text-customGreen">
              {events.length}{" "}
              {events.length === 1
                ? "aktualita"
                : events.length <= 4
                  ? "aktuality"
                  : "aktualit"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCardSingle key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventCardList;
