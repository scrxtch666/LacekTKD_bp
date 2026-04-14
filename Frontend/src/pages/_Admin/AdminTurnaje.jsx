import { useState, useEffect } from "react";
import { Plus, Trophy } from "lucide-react";
import { getUserRole } from "../../utils/auth";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import config from "../../../config";
import TournamentForm from "../AdminTurnaje/TournamentForm";
import TournamentList from "../AdminTurnaje/TournamentList";
import TournamentRegistrations from "../AdminTurnaje/TournamentRegistrations";
import TournamentFilters from "../AdminTurnaje/TournamentFilters";

const API = config.API_URL;

function AdminTurnaje() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [userRole, setUserRole] = useState(getUserRole());
  const [activeTab, setActiveTab] = useState("turnaje");

  
  const [showRegisterModal, setShowRegisterModal] = useState(null);
  const [selectedFighter, setSelectedFighter] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  
  const [registrations, setRegistrations] = useState([]);
  const [loadingReg, setLoadingReg] = useState(false);

  
  const [showAddForm, setShowAddForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filterActual, setFilterActual] = useState(false);
  const [filterOld, setFilterOld] = useState(false);
  const [filterTournament, setFilterTournament] = useState("");

  const isAdminOrTrainer = userRole === "admin" || userRole === "trainer";

  useEffect(() => {
    const handleAuthChange = () => setUserRole(getUserRole());
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  useEffect(() => {
    fetchTournaments();
    fetchTypes();
    fetch(`${API}/api/fighters`)
      .then((r) => r.json())
      .then((d) => setFighters(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const fetchTournaments = () => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/tournaments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((d) => {
        setTournaments(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setTournaments([]);
        setLoading(false);
      });
  };

  const fetchTypes = () => {
    fetch(`${API}/api/tournaments/types`)
      .then((r) => r.json())
      .then((d) => setTypes(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  const fetchRegistrations = () => {
    setLoadingReg(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingReg(false);
      return;
    }
    fetch(`${API}/api/tournamentRegistration`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setRegistrations(
          Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [],
        );
        setLoadingReg(false);
      })
      .catch(() => setLoadingReg(false));
  };

  const handleAdminRegisterFighter = async () => {
    if (!selectedFighter) return alert("Vyber závodníka");
    setRegisterLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API}/api/tournamentRegistration/${showRegisterModal}/fighter/${selectedFighter}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (res.ok) {
      setShowRegisterModal(null);
      setSelectedFighter("");
      fetchRegistrations();
    } else alert(data.error || "Nepodařilo se přihlásit závodníka");
    setRegisterLoading(false);
  };

  // Filtrování
  const today = new Date().setHours(0, 0, 0, 0);
  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const tourDate = new Date(t.end_date_raw || t.start_date_raw).setHours(
      0,
      0,
      0,
      0,
    );
    const timeFilterActive = filterActual || filterOld;
    const matchesTime =
      !timeFilterActive ||
      (filterActual && tourDate >= today) ||
      (filterOld && tourDate < today);
    const matchesStatus =
      filterTournament === "" ||
      (filterTournament === "completed" && t.status === "completed") ||
      (filterTournament === "uncompleted" && t.status !== "completed");
    const matchesRole = userRole !== "user" || t.status === "completed";
    return matchesSearch && matchesTime && matchesStatus && matchesRole;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Načítám turnaje...</div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">
          {isAdminOrTrainer ? "Správa turnajů" : "Turnaje"}
        </div>
        {!showAddForm && activeTab === "turnaje" && isAdminOrTrainer && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Přidat turnaj</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <TournamentForm
          types={types}
          API={API}
          onSuccess={() => {
            setShowAddForm(false);
            fetchTournaments();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <TournamentFilters
        search={search}
        onSearchChange={setSearch}
        filterTournament={filterTournament}
        onFilterTournamentChange={setFilterTournament}
        filterActual={filterActual}
        onFilterActualChange={setFilterActual}
        filterOld={filterOld}
        onFilterOldChange={setFilterOld}
        isAdminOrTrainer={isAdminOrTrainer}
      />

      {/* Záložky */}
      <div className="flex gap-2 border-b border-gray-200">
        {["turnaje", "prihlasky"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "prihlasky") fetchRegistrations();
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-customGreen text-customGreen"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "turnaje" ? "Turnaje" : "Přihlášky"}
          </button>
        ))}
      </div>

      {activeTab === "turnaje" && (
        <TournamentList
          tournaments={filteredTournaments}
          allTournaments={tournaments}
          types={types}
          userRole={userRole}
          API={API}
          onRefresh={fetchTournaments}
          onOpenRegisterModal={(id) => {
            setShowRegisterModal(id);
            setSelectedFighter("");
          }}
        />
      )}

      {activeTab === "prihlasky" && (
        <TournamentRegistrations
          registrations={registrations}
          loading={loadingReg}
          userRole={userRole}
          API={API}
          onRefresh={fetchRegistrations}
          onOpenRegisterModal={(id) => {
            setShowRegisterModal(id);
            setSelectedFighter("");
          }}
        />
      )}

      {/* Modal přihlášení závodníka */}
      {showRegisterModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  Přihlásit závodníka
                </h3>
                <button
                  onClick={() => setShowRegisterModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <select
                value={selectedFighter}
                onChange={(e) => setSelectedFighter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">-- Vyber závodníka --</option>
                {fighters.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.surname}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAdminRegisterFighter}
                  disabled={registerLoading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {registerLoading ? "Přihlašuji..." : "Přihlásit"}
                </button>
                <button
                  onClick={() => setShowRegisterModal(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default AdminTurnaje;
