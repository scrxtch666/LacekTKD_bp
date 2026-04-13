import SearchBar from "../pages/Turnaje/SearchBar";
import TurnajList from "../pages/Turnaje/TurnajList";
import { useState, useEffect } from "react";
import config from "../../config";

const API = config.API_URL;

function Turnaje() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  useEffect(() => {
    fetch(`${API}/api/tournaments/`)
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        setUpcoming(data.filter((t) => new Date(t.start_date_raw) >= now));
        setPast(data.filter((t) => new Date(t.start_date_raw) < now));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="devider">Turnaje</div>
      <main className="space-y-8">
        <SearchBar
          search={search}
          setSearch={setSearch}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        <TurnajList
          title="Nadcházející turnaje"
          tournaments={upcoming}
          search={search}
          selectedPeriod={selectedPeriod}
        />

        <TurnajList
          title="Proběhlé turnaje"
          tournaments={past}
          search={search}
          selectedPeriod={selectedPeriod}
        />

        {loading && (
          <div className="text-gray-400 text-center py-10">
            Načítám turnaje...
          </div>
        )}
      </main>
    </>
  );
}

export default Turnaje;
