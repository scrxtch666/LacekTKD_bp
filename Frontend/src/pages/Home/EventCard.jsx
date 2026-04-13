import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

const API = config.API_URL;

function EventCard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const navigate = useNavigate();

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

  const sortedGroups = Object.entries(groups).sort(([a], [b]) => b - a);

  return (
    <div className="space-y-8">
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
            <option key={period} value={period}>
              {period}
            </option>
          ))}
        </select>

        {(search || selectedPeriod) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedPeriod("");
            }}
            className="bg-customWhite px-4 py-2 rounded-lg transition-colors"
          >
            Zrušit filtry
          </button>
        )}
      </div>

      {sortedGroups.length === 0 && (
        <p className="text-gray-400 text-center italic py-8">
          Žádná aktualita neodpovídá zadaným filtrům
        </p>
      )}

      {sortedGroups.map(([year, events]) => (
        <div key={year}>
          <div className="devider flex justify-between mb-4">
            <span>{year}</span>
            <span className="text-customGreen">
              {events.length}{" "}
              {events.length === 1
                ? "aktualita"
                : events.length <= 4
                  ? "aktuality"
                  : "aktualit"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/aktualita/${event.id}`)}
                className="max-w-sm overflow-hidden bg-pink-50 rounded-2xl shadow-xl"
              >
                <div className="relative">
                  {event.cover_photo ? (
                    <img
                      src={`${API}${event.cover_photo}`}
                      alt={event.title}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="w-full h-52 bg-customGreen flex items-center justify-center text-white text-2xl font-bold">
                      {event.title}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="px-4 py-3"></div>
                  </div>
                </div>

                <div className="px-4 py-2 bg-customWhite">
                  <div className="">
                    <span className="text-customGreen text-sm font-medium flex justify-between gap-5">
                      <p className="text-customBlack">{event.title}</p>
                      <p>{event.date_start}</p>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventCard;
