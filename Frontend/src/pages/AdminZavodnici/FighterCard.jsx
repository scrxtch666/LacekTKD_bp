import {
  Eye,
  EyeOff,
  Star,
  Trophy,
  User,
  UserX,
  Mail,
  Phone,
  Pencil,
  Trash2,
} from "lucide-react";

function FighterCard({
  fighter,
  API,
  onNavigate,
  onEdit,
  onDelete,
  isDeleting,
}) {
  return (
    <div
      onClick={onNavigate}
      className="flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
    >
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-semibold flex-shrink-0">
        {fighter.id}
      </span>

      <div className="flex-shrink-0">
        {fighter.img_path ? (
          <img
            src={`${API}${fighter.img_path}`}
            alt={fighter.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 noPfp">
            {fighter.name?.charAt(0).toUpperCase() || "Z"}
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <p className="text-lg font-semibold text-gray-800">
          {fighter.name} {fighter.surname}
        </p>
        <p className="text-sm text-gray-500">
          {fighter.birth
            ? new Date(fighter.birth).toLocaleDateString("cs-CZ")
            : "Datum narození neznámé"}
          {fighter.actual_weight_category
            ? ` · ${fighter.actual_weight_category} kg`
            : ""}
        </p>

        <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${fighter.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
          >
            {fighter.active ? (
              <Eye size={11} className="mr-1" />
            ) : (
              <EyeOff size={11} className="mr-1" />
            )}
            {fighter.active ? "Aktivní" : "Neaktivní"}
          </span>
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
          {fighter.user_login ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <User size={11} />
              {fighter.user_login}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <UserX size={11} />
              Nepřiřazený účet
            </span>
          )}
        </div>

        {fighter.user_login && (fighter.user_email || fighter.user_phone) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1 justify-center sm:justify-start">
            {fighter.user_email && (
              <>
                <Mail size={14} />
                <span>{fighter.user_email}</span>
              </>
            )}
            {fighter.user_phone && (
              <>
                <Phone size={14} />
                <span>{fighter.user_phone}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={onEdit} className="editBtn">
          <Pencil size={18} />
          <span>Editovat</span>
        </button>
        <button onClick={onDelete} disabled={isDeleting} className="deleteBtn">
          <Trash2 size={18} />
          <span>{isDeleting ? "Mažu..." : "Smazat"}</span>
        </button>
      </div>
    </div>
  );
}

export default FighterCard;
