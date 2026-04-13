import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Trophy } from "lucide-react";
import config from "../../../config";

const API = config.API_URL;

const BELT_ORDER = [
  "5. DAN",
  "4. DAN",
  "3. DAN",
  "2. DAN",
  "1. DAN",
  "1. CUP",
  "2. CUP",
  "3. CUP",
  "4. CUP",
  "5. CUP",
  "6. CUP",
  "7. CUP",
  "8. CUP",
  "9. CUP",
  "10. CUP",
];

function Fighter() {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBelt, setFilterBelt] = useState("");
  const [filterBest, setFilterBest] = useState(false);
  const [filterLegend, setFilterLegend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/fighters`)
      .then((response) => response.json())
      .then((data) => {
        setFighters(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Načítám data...</div>;

  const groups = fighters.reduce((acc, fighter) => {
    const key = fighter.cup || "Ostatní";
    if (!acc[key]) acc[key] = { fighters: [], belt_path: fighter.belt_path };
    acc[key].fighters.push(fighter);
    return acc;
  }, {});

  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    const ai = BELT_ORDER.indexOf(a.trim());
    const bi = BELT_ORDER.indexOf(b.trim());

    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const filteredGroups = sortedGroups
    .map(([cup, group]) => [
      cup,
      {
        ...group,
        fighters: group.fighters.filter((fighter) => {
          const matchesSearch = `${fighter.name} ${fighter.surname}`
            .toLowerCase()
            .includes(search.toLowerCase());
          const matchesBelt = filterBelt === "" || fighter.cup === filterBelt;
          const matchesBest = !filterBest || fighter.best === 1;
          const matchesLegend = !filterLegend || fighter.legend === 1;
          return matchesSearch && matchesBelt && matchesBest && matchesLegend;
        }),
      },
    ])
    .filter(([, group]) => group.fighters.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat závodníka..."
          className="bg-customWhite flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        />

        <select
          value={filterBelt}
          onChange={(e) => setFilterBelt(e.target.value)}
          className="bg-customWhite px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customGreen focus:border-transparent"
        >
          <option value="">Všechny pásy</option>
          {BELT_ORDER.map((belt) => (
            <option key={belt} value={belt}>
              {belt}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilterBest(!filterBest)}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            filterBest
              ? "bg-customGreen text-white border-customGreen"
              : "bg-customWhite border-gray-300"
          }`}
        >
          <Star size={11} />
          Nejlepší
        </button>

        <button
          onClick={() => setFilterLegend(!filterLegend)}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            filterLegend
              ? "bg-customGreen text-white border-customGreen"
              : "bg-customWhite border-gray-300"
          }`}
        >
          <Trophy size={11} />
          Legenda
        </button>

        {(search || filterBelt || filterBest || filterLegend) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterBelt("");
              setFilterBest(false);
              setFilterLegend(false);
            }}
            className="px-4 py-2 bg-customWhite rounded-lg text-sm transition-colors"
          >
            Zrušit filtry
          </button>
        )}
      </div>
      {filteredGroups.map(([cup, group]) => (
        <div key={cup}>
          <div className="devider flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <img
                src={group.belt_path}
                alt={cup}
                className="w-9 object-cover object-center"
              />
              <span>{cup}</span>
            </div>
            <span className="text-customGreen">
              {group.fighters?.length || 0}{" "}
              {group.fighters?.length === 1
                ? "závodník"
                : group.fighters?.length >= 2 && group.fighters?.length <= 4
                  ? "závodníci"
                  : "závodníků"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.fighters.map((fighter) => (
              <div
                key={fighter.id}
                onClick={() => navigate(`/zavodnik/${fighter.id}`)}
                className="w-full min-h-40 bg-customWhite text-customBlack rounded-md p-2 flex flex-row gap-2"
              >
                <div className="w-28 flex-shrink-0 rounded-xl overflow-hidden self-stretch">
                  {fighter.img_path ? (
                    <img
                      src={`${API}${fighter.img_path}`}
                      alt={fighter.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl noPfp">
                      {fighter.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col text-left flex-1 justify-between overflow-hidden">
                  <span className="font-semibold truncate">
                    {fighter.name} {fighter.surname}
                  </span>

                  <div className="flex flex-col gap-0.5 min-h-[48px] justify-center">
                    {(fighter.tournament_results || []).length > 0 ? (
                      fighter.tournament_results.map((result, i) => (
                        <span key={i} className="text-xs truncate">
                          {result.place}. {result.tournament} ({result.date})
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic justify-center flex">
                        Zatím žádný úspěch
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="border border-customGreen text-customGreen text-xs font-medium px-2.5 py-0.5 rounded w-full flex items-center justify-center">
                      ÚSPĚCHY
                    </span>

                    <div className="flex justify-evenly gap-1">
                      <span className="border border-customGreen text-customGreen text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 flex-1 justify-center">
                        <div className="inline-flex rounded-full h-4 w-4 bg-customGreen flex-shrink-0">
                          <img
                            className="px-0.5 py-0.5"
                            src="/assets/Icons/belt.png"
                            alt=""
                          />
                        </div>
                        {fighter.cup}
                      </span>

                      {fighter.best === 1 && (
                        <span className="border border-customGreen text-customGreen text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 flex-1 justify-center">
                          <div className="inline-flex rounded-full h-4 w-4 bg-customGreen flex-shrink-0">
                            <img
                              className="px-0.5 py-0.5"
                              src="/assets/Icons/medal.png"
                              alt=""
                            />
                          </div>
                          BEST
                        </span>
                      )}

                      {fighter.legend === 1 && (
                        <span className="border border-customGreen text-customGreen text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 flex-1 justify-center">
                          <div className="inline-flex rounded-full h-4 w-4 bg-customGreen flex-shrink-0">
                            <img
                              className="px-0.5 py-0.5"
                              src="/assets/Icons/trophy.png"
                              alt=""
                            />
                          </div>
                          LEGEND
                        </span>
                      )}
                    </div>
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

export default Fighter;
