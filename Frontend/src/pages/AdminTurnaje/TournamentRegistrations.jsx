import { useState } from "react";
import { Trophy, MapPin, Calendar, Plus, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("cs-CZ") : "—");

function TournamentRegistrations({
  registrations,
  loading,
  userRole,
  API,
  onRefresh,
  onOpenRegisterModal,
}) {
  const navigate = useNavigate();
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [editingResult, setEditingResult] = useState(null);

  const handleAdminUnregister = async (id) => {
    if (!confirm("Odhlásit závodníka?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/tournamentRegistration/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onRefresh();
    else alert("Nepodařilo se odhlásit závodníka");
  };

  const handleSaveResult = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API}/api/tournamentRegistration/${editingResult.regId}/result`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ place: editingResult.place }),
      },
    );
    if (res.ok) {
      setEditingResult(null);
      onRefresh();
    } else alert("Nepodařilo se uložit výsledek");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Načítám přihlášky...
      </div>
    );

  if (!registrations.length)
    return (
      <div className="bg-customWhite rounded-lg shadow p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Žádné přihlášky</p>
      </div>
    );

  const groups = registrations.reduce((acc, reg) => {
    const key = `${reg.tournament_id}__${reg.tournament_name}`;
    if (!acc[key])
      acc[key] = {
        fighters: [],
        tournament_name: reg.tournament_name,
        tournament_location: reg.tournament_location,
        tournament_start_date: reg.tournament_start_date,
        tournament_end_date: reg.tournament_end_date,
        tournament_img: reg.tournament_img,
        type_name: reg.type_name,
      };
    acc[key].fighters.push(reg);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([key, group]) => {
        const [tournamentId] = key.split("__");
        const isExpanded = expandedTournament === tournamentId;

        return (
          <div
            key={key}
            className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0">
                  {group.tournament_img ? (
                    <img
                      src={`${API}${group.tournament_img}`}
                      alt={group.tournament_name}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                      <Trophy size={28} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-lg font-semibold text-gray-800">
                      {group.tournament_name}
                    </p>
                    {group.type_name && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.type_name}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      {group.fighters.length}{" "}
                      {group.fighters.length === 1
                        ? "závodník"
                        : group.fighters.length <= 4
                          ? "závodníci"
                          : "závodníků"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {group.tournament_location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {group.tournament_location}
                      </span>
                    )}
                    {group.tournament_start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDate(group.tournament_start_date)}
                        {group.tournament_end_date &&
                        group.tournament_end_date !==
                          group.tournament_start_date
                          ? ` – ${formatDate(group.tournament_end_date)}`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {(userRole === "admin" || userRole === "trainer") && (
                    <button
                      onClick={() => onOpenRegisterModal(tournamentId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                    >
                      <Plus size={15} />
                      Přihlásit závodníka
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setExpandedTournament(isExpanded ? null : tournamentId)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-customWhite border border-customGreen text-customBlack rounded-lg text-sm"
                  >
                    {isExpanded ? "Skrýt závodníky ▲" : "Zobrazit závodníky ▼"}
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100">
                {group.fighters.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/zavodnik/${reg.fighter_id}`)}
                    >
                      {reg.fighter_pfp ? (
                        <img
                          src={`${API}${reg.fighter_pfp}`}
                          alt={reg.fighter_name}
                          className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">
                          {reg.fighter_name?.charAt(0)}
                          {reg.fighter_surname?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {reg.fighter_name} {reg.fighter_surname}
                        </p>
                        {reg.fighter_weight && (
                          <p className="text-xs text-gray-400">
                            {reg.fighter_weight} kg
                          </p>
                        )}
                        {reg.place && (
                          <p className="text-xs font-bold">
                            {reg.place}. místo
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingResult?.regId === reg.id ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="number"
                            min="1"
                            max="99"
                            placeholder="Místo"
                            value={editingResult.place}
                            onChange={(e) =>
                              setEditingResult({
                                ...editingResult,
                                place: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={handleSaveResult}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                          >
                            Uložit
                          </button>
                          <button
                            onClick={() => setEditingResult(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                          >
                            Zrušit
                          </button>
                        </div>
                      ) : (
                        (userRole === "admin" || userRole === "trainer") && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingResult({
                                  regId: reg.id,
                                  place: reg.place || "",
                                });
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-xs"
                            >
                              <Pencil size={11} />
                              Výsledek
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdminUnregister(reg.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs"
                            >
                              <X size={12} />
                              Odhlásit
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TournamentRegistrations;
