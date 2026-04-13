import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Users, Info, Star, Trophy } from "lucide-react";
import { getUserRole } from "../../utils/auth";
import NotFound from "../Login/NotFound";
import config from "../../../config";

const API = config.API_URL;

function FighterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fighter, setFighter] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRole = getUserRole();

  useEffect(() => {
    fetch(`${API}/api/fighters/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Nenalezeno");
        }
        return res.json();
      })
      .then((data) => {
        setFighter(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFighter(null);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("cs-CZ") : "—";

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Načítám...
      </div>
    );

  if (!fighter) return <NotFound />;

  return (
    <div className="max-w-4xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-customGreen transition-colors"
      >
        <ArrowLeft size={16} /> Zpět na závodníky
      </button>

      <div className="bg-customWhite rounded-2xl shadow-md overflow-hidden p-6 flex gap-6 relative">
        {fighter.img_path ? (
          <img
            src={`${API}${fighter.img_path}`}
            alt={fighter.name}
            className="w-40 h-40 object-cover rounded-xl"
          />
        ) : (
          <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
            {fighter.name?.charAt(0).toUpperCase() || "Z"}
          </div>
        )}

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {fighter.name} {fighter.surname}
            </h1>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mt-1">
                {fighter.belt_path && (
                  <img
                    src={fighter.belt_path}
                    alt="belt"
                    className="w-7 h-7 object-contain"
                  />
                )}
                <span className="text-sm text-gray-500">{fighter.cup}</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              {!!fighter.best && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star size={11} />
                  Nejlepší
                </span>
              )}
              {!!fighter.legend && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Trophy size={11} />
                  Legenda
                </span>
              )}
            </div>

            {(userRole === "admin" || userRole === "trainer") &&
              fighter.age && (
                <p className="text-gray-500">Věk: {fighter.age} let</p>
              )}
            {fighter.actual_weight_category && (
              <p className="text-gray-500">
                Váhová kategorie: {fighter.actual_weight_category} kg
              </p>
            )}
            {fighter.category_name && (
              <p className="text-gray-500">
                Věková kategorie: {fighter.category_name}{" "}
                <span className="text-xs">
                  ({fighter.min} - {fighter.max})
                </span>
              </p>
            )}
            {(userRole === "admin" || userRole === "trainer") && (
              <>
                {fighter.user_email && (
                  <p className="text-gray-500">Email: {fighter.user_email}</p>
                )}
                {fighter.user_phone && (
                  <p className="text-gray-500">
                    Telefonní číslo: {fighter.user_phone}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users size={18} />
          Výsledky turnajů
        </h2>

        {fighter.tournament_results?.length ? (
          <div className="space-y-3">
            {fighter.tournament_results.map((r, i) => (
              <div
                key={i}
                onClick={() => navigate(`/turnaj/${r.tournament_id}`)}
                className="flex justify-between border-b cursor-pointer pb-2 text-sm"
              >
                <div>
                  <p className="font-medium">{r.tournament}</p>
                  <p className="text-gray-400 flex items-center gap-1">
                    <Calendar size={14} /> {r.date}
                  </p>
                </div>

                <div className="font-semibold">{r.place}. místo</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Žádné výsledky</p>
        )}
      </div>
    </div>
  );
}

export default FighterDetail;
