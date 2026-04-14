import { useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  CalendarOff,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import TournamentForm from "./TournamentForm";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("cs-CZ") : "—");

const getColorClass = (date) => {
  const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "text-red-600";
  if (diff <= 3) return "text-orange-500";
  return "text-green-600";
};

function TournamentList({
  tournaments,
  allTournaments,
  types,
  userRole,
  API,
  onRefresh,
  onOpenRegisterModal,
}) {
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Opravdu smazat tento turnaj?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/api/tournaments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
      else alert("Nepodařilo se smazat turnaj");
    } catch {
      alert("Chyba při mazání");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (tournament) => {
    const newStatus =
      tournament.status === "completed" ? "uncompleted" : "completed";
    if (
      !confirm(
        `Označit jako "${newStatus === "completed" ? "Zveřejněný" : "Nezveřejněný"}"?`,
      )
    )
      return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/tournaments/${tournament.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) onRefresh();
  };

  const handleRegister = async (tournamentId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/tournaments/${tournamentId}/register`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) onRefresh();
    else alert(data.error || "Nepodařilo se přihlásit.");
  };

  const handleUnregister = async (tournamentId) => {
    if (!confirm("Odhlásit se z turnaje?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/tournaments/${tournamentId}/register`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) onRefresh();
    else alert(data.error || "Nepodařilo se odhlásit.");
  };

  if (!tournaments.length)
    return (
      <div className="bg-customWhite rounded-lg shadow p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">
          {allTournaments.length === 0
            ? "Zatím nejsou žádné turnaje"
            : "Žádné turnaje neodpovídají filtrům"}
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
        >
          {editingId === tournament.id ? (
            <TournamentForm
              types={types}
              API={API}
              initialData={{
                id: tournament.id,
                name: tournament.name || "",
                location: tournament.location || "",
                price: tournament.price || "",
                type_id: tournament.type_id || "",
                start_date: tournament.start_date_raw?.substring(0, 10) || "",
                end_date: tournament.end_date_raw?.substring(0, 10) || "",
                registrable_date:
                  tournament.registrable_date_raw?.substring(0, 10) || "",
                info: tournament.info || "",
                status: tournament.status || "",
                image: null,
              }}
              onSuccess={() => {
                setEditingId(null);
                onRefresh();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold text-sm flex-shrink-0">
                {tournament.id}
              </span>
              <div className="flex-shrink-0">
                {tournament.img_path ? (
                  <img
                    src={`${API}${tournament.img_path}`}
                    alt={tournament.name}
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
                    {tournament.name}
                  </p>
                  {tournament.type_name && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tournament.type_name}
                    </span>
                  )}
                  {(userRole === "admin" || userRole === "trainer") && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${tournament.status === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {tournament.status === "completed"
                        ? "✓ Zveřejněný"
                        : "○ Nezveřejněný"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  {tournament.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {tournament.location}
                    </span>
                  )}
                  {tournament.start_date_raw && (
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {formatDate(tournament.start_date_raw)}
                      {tournament.end_date_raw &&
                      tournament.end_date_raw !== tournament.start_date_raw
                        ? ` – ${formatDate(tournament.end_date_raw)}`
                        : ""}
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1 ${getColorClass(tournament.registrable_date_raw)}`}
                  >
                    <CalendarOff size={13} />
                    registrace do: {tournament.registrable_date_formatted}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                {userRole === "user" &&
                  (() => {
                    const isRegistered = !!tournament.is_registered;
                    const uzaverka = new Date(tournament.registrable_date_raw);
                    uzaverka.setHours(23, 59, 59, 999);
                    const jePoUzaverce = new Date() > uzaverka;

                    if (jePoUzaverce)
                      return (
                        <div className="flex items-center gap-2">
                          {isRegistered && (
                            <span className="px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium">
                              ✓ Přihlášen
                            </span>
                          )}
                          <button
                            disabled
                            className="bg-gray-50 text-gray-400 border border-gray-200 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                          >
                            Po uzávěrce
                          </button>
                        </div>
                      );
                    if (isRegistered)
                      return (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg text-sm font-medium">
                            ✓ Přihlášen
                          </span>
                          <button
                            onClick={() => handleUnregister(tournament.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 px-3 py-2 rounded-lg text-sm"
                          >
                            Odhlásit se
                          </button>
                        </div>
                      );
                    return (
                      <button
                        onClick={() => handleRegister(tournament.id)}
                        className="bg-customGreen hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Přihlásit se
                      </button>
                    );
                  })()}

                {(userRole === "admin" || userRole === "trainer") && (
                  <>
                    <button
                      onClick={() => handleToggleStatus(tournament)}
                      className={`px-4 py-2 rounded-lg text-white text-sm transition-colors ${tournament.status === "completed" ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}`}
                    >
                      {tournament.status === "completed"
                        ? "Skrýt"
                        : "Zveřejnit"}
                    </button>
                    <button
                      onClick={() => setEditingId(tournament.id)}
                      className="editBtn"
                    >
                      <Pencil size={18} />
                      <span>Editovat</span>
                    </button>
                    <button
                      onClick={() => handleDelete(tournament.id)}
                      disabled={deleting === tournament.id}
                      className="deleteBtn"
                    >
                      <Trash2 size={18} />
                      <span>
                        {deleting === tournament.id ? "Mažu..." : "Smazat"}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TournamentList;
