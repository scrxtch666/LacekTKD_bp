import { useState, useEffect } from "react";
import { UserPlus, UserX, Star, Trophy } from "lucide-react";
import { getUserRole } from "../../utils/auth";
import config from "../../../config";
import FighterList from "../AdminZavodnici/FighterList";
import FighterAddForm from "../AdminZavodnici/FighterAddForm";
import FighterFilters from "../AdminZavodnici/FighterFilters";

const API = config.API_URL;

function AdminZavodnici() {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [belts, setBelts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filterBest, setFilterBest] = useState(false);
  const [filterLegend, setFilterLegend] = useState(false);
  const [filterAccount, setFilterAccount] = useState("");

  useEffect(() => {
    fetchFighters();
    fetchBelts();
    fetchCategories();
  }, []);

  const fetchFighters = () => {
    const role = getUserRole();
    const url =
      role === "admin" || role === "trainer"
        ? `${API}/api/fighters/admin`
        : `${API}/api/fighters`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setFighters(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setFighters([]);
        setLoading(false);
      });
  };

  const fetchBelts = () => {
    fetch(`${API}/api/belts`)
      .then((r) => r.json())
      .then((d) => setBelts(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  const fetchCategories = () => {
    fetch(`${API}/api/category`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  };

  const filteredFighters = fighters.filter((f) => {
    const matchesSearch = `${f.name} ${f.surname}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesBest = !filterBest || f.best === 1;
    const matchesLegend = !filterLegend || f.legend === 1;
    const matchesAccount =
      filterAccount === "" ||
      (filterAccount === "assigned" && f.user_login) ||
      (filterAccount === "unassigned" && !f.user_login);
    return matchesSearch && matchesBest && matchesLegend && matchesAccount;
  });

  const hasActiveFilter = search || filterBest || filterLegend || filterAccount;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Načítám závodníky...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">Správa závodníků</div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <UserPlus size={20} />
            <span>Přidat závodníka</span>
          </button>
        )}
      </div>

      <FighterFilters
        search={search}
        onSearchChange={setSearch}
        filterAccount={filterAccount}
        onFilterAccountChange={setFilterAccount}
        filterBest={filterBest}
        onFilterBestChange={setFilterBest}
        filterLegend={filterLegend}
        onFilterLegendChange={setFilterLegend}
      />

      {showAddForm && (
        <FighterAddForm
          belts={belts}
          categories={categories}
          API={API}
          onSuccess={() => {
            setShowAddForm(false);
            fetchFighters();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {filteredFighters.length === 0 ? (
        <div className="bg-customWhite rounded-lg shadow p-8 text-center">
          <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {hasActiveFilter
              ? "Žádný závodník neodpovídá filtrům"
              : "Zatím nejsou žádní závodníci"}
          </p>
        </div>
      ) : (
        <FighterList
          fighters={filteredFighters}
          belts={belts}
          categories={categories}
          API={API}
          onRefresh={fetchFighters}
        />
      )}
    </div>
  );
}

export default AdminZavodnici;
