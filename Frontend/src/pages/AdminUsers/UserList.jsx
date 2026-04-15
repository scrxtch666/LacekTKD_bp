import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import UserCard from "./UserCard";

function UserList({ users, roles, fighters, onRefresh, API }) {
  const [deleting, setDeleting] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Opravdu chcete smazat tohoto uživatele?")) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`,
      "Content-Type": "application/json" },
      });
      if (res.ok) onRefresh();
      else {
        const data = await res.json();
        alert(data.error || "Nepodařilo se smazat uživatele");
      }
    } catch {
      alert("Chyba při mazání");
    } finally {
      setDeleting(null);
    }
  };

  if (!users.length)
    return (
      <div className="bg-customWhite rounded-lg shadow p-8 text-center">
        <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Zatím nejsou žádní uživatelé</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          roles={roles}
          fighters={fighters}
          isEditing={editingId === user.id}
          onStartEdit={() => setEditingId(user.id)}
          onCancelEdit={() => setEditingId(null)}
          onEditSuccess={() => {
            setEditingId(null);
            onRefresh();
          }}
          onDelete={() => handleDelete(user.id)}
          isDeleting={deleting === user.id}
          API={API}
        />
      ))}
    </div>
  );
}

export default UserList;
