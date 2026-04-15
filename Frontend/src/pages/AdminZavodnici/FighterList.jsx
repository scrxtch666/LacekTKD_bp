import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import FighterCard from "./FighterCard";
import FighterEditForm from "./FighterEditForm";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
function FighterList({ fighters, belts, categories, API, onRefresh }) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tohoto závodníka?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/api/fighters/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (res.ok) onRefresh();
      else alert("Nepodařilo se smazat závodníka");
    } catch {
      alert("Chyba při mazání");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {fighters.map((fighter) => (
        <div
          key={fighter.id}
          className="bg-customWhite rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
        >
          {editingId === fighter.id ? (
            <FighterEditForm
              fighter={fighter}
              belts={belts}
              categories={categories}
              API={API}
              onSuccess={() => {
                setEditingId(null);
                onRefresh();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <FighterCard
              fighter={fighter}
              API={API}
              onNavigate={() => navigate(`/zavodnik/${fighter.id}`)}
              onEdit={() => setEditingId(fighter.id)}
              onDelete={() => handleDelete(fighter.id)}
              isDeleting={deleting === fighter.id}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default FighterList;
