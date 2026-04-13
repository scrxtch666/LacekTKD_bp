import React, { useState, useEffect } from "react";
import { MapPin, Euro, Tag, Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

const API = config.API_URL;

function Turnaj() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/tournaments/`)
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        const upcomingFiltered = Array.isArray(data)
          ? data
              .filter((t) => new Date(t.start_date_raw) >= now)
              .sort(
                (a, b) =>
                  new Date(a.start_date_raw) - new Date(b.start_date_raw),
              )
          : [];
        const pastFiltered = Array.isArray(data)
          ? data
              .filter((t) => new Date(t.start_date_raw) < now)
              .sort(
                (a, b) =>
                  new Date(b.start_date_raw) - new Date(a.start_date_raw),
              )
          : [];
        setUpcoming(upcomingFiltered);
        setPast(pastFiltered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-gray-400 text-center py-10">Načítám turnaje...</div>
    );

  const periods = ["Nadcházející", "Proběhlé"];

  const filterEvents = (events, type) => {
    return events.filter((t) => {
      const matchesSearch = t.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesPeriod = selectedPeriod === "" || selectedPeriod === type;
      return matchesSearch && matchesPeriod;
    });
  };

  const filteredUpcoming = filterEvents(upcoming, "Nadcházející");
  const filteredPast = filterEvents(past, "Proběhlé");

  const renderEvent = (event) => (
    <div
      key={event.id}
      onClick={() => navigate(`/turnaj/${event.id}`)}
      className="bg-customWhite rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row cursor-pointer"
    >
      <div className="sm:w-44 sm:flex-shrink-0 h-44 sm:h-auto">
        {event.img_path ? (
          <img
            src={`${API}${event.img_path}`}
            alt={event.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-customGreen flex items-center justify-center text-white text-4xl font-bold">
            {event.name?.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between p-4 flex-1 min-w-0 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-extrabold text-lg leading-tight truncate">
            {event.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
          {event.location && (
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.price !== undefined && event.price !== null && (
            <div className="flex items-center gap-2 min-w-0">
              <Euro size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">Startovné: {event.price} Kč</span>
            </div>
          )}
          {(event.start_date_formatted || event.end_date_formatted) && (
            <div className="flex items-center gap-2 min-w-0">
              <Calendar size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">
                {event.start_date_formatted} – {event.end_date_formatted}
              </span>
            </div>
          )}
          {event.type_name && (
            <div className="flex items-center gap-2 min-w-0">
              <Tag size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">{event.type_name}</span>
            </div>
          )}
        </div>

        {event.info && (
          <div className="flex items-start gap-2 text-sm text-gray-500 border-t border-gray-100 pt-3 min-w-0">
            <Info size={15} className="text-customGreen flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2 min-w-0">{event.info}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-col sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat turnaj..."
          className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        />

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        >
          <option value="">Všechny turnaje</option>
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

      {filteredUpcoming.length > 0 && (
        <div>
          <div className="devider mb-4">nadcházející turnaje</div>
          <div className="flex flex-col gap-4">
            {filteredUpcoming.map(renderEvent)}
          </div>
        </div>
      )}

      {filteredPast.length > 0 && (
        <div>
          <div className="devider mb-4">proběhlé turnaje</div>
          <div className="flex flex-col gap-4">
            {filteredPast.map(renderEvent)}
          </div>
        </div>
      )}

      {filteredUpcoming.length === 0 && filteredPast.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          Žádný turnaj neodpovídá zadaným filtrům
        </p>
      )}
    </div>
  );
}

export default Turnaj;
