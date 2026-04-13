import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import config from "../../../config";
import UserList from "../AdminUsers/UserList";
import UserAddForm from "../AdminUsers/UserAddForm";

const API = config.API_URL;

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchFighters();
  }, []);

  const fetchUsers = () => {
    fetch(`${API}/api/users`)
      .then((res) => res.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setUsers([]); setLoading(false); });
  };

  const fetchRoles = () => {
    fetch(`${API}/api/roles`)
      .then((res) => res.json())
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchFighters = () => {
    fetch(`${API}/api/fighters`)
      .then((res) => res.json())
      .then((data) => setFighters(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Načítám uživatele...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="devider">Správa uživatelů</div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <UserPlus size={20} />
            <span>Přidat uživatele</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <UserAddForm
          roles={roles}
          fighters={fighters}
          onSuccess={() => { setShowAddForm(false); fetchUsers(); }}
          onCancel={() => setShowAddForm(false)}
          API={API}
        />
      )}

      <UserList
        users={users}
        roles={roles}
        fighters={fighters}
        onRefresh={fetchUsers}
        API={API}
      />
    </div>
  );
}

export default AdminUsers;