import { MapPin, Euro, Tag, Calendar, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

const API = config.API_URL;

function TurnajCard({ tournament }) {
  const navigate = useNavigate();
  const {
    id,
    name,
    location,
    price,
    type_name,
    start_date_formatted,
    end_date_formatted,
    img_path,
    info,
  } = tournament;

  return (
    <div
      onClick={() => navigate(`/turnaj/${id}`)}
      className="bg-customWhite rounded-2xl shadow-md overflow-hidden flex flex-col sm:flex-row cursor-pointer"
    >
      <div className="sm:w-44 sm:flex-shrink-0 h-44 sm:h-auto">
        {img_path ? (
          <img
          src={`${API}${img_path}`}
            alt={name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-customGreen flex items-center justify-center text-white text-4xl font-bold">
            {name?.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between p-4 flex-1 min-w-0 gap-3">
        <h2 className="font-extrabold text-lg leading-tight truncate">
          {name}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
          {location && (
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {price !== undefined && price !== null && (
            <div className="flex items-center gap-2 min-w-0">
              <Euro size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">Startovné: {price} Kč</span>
            </div>
          )}
          {start_date_formatted && (
            <div className="flex items-center gap-2 min-w-0">
              <Calendar size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">
                {start_date_formatted}
                {end_date_formatted &&
                end_date_formatted !== start_date_formatted
                  ? ` – ${end_date_formatted}`
                  : ""}
              </span>
            </div>
          )}
          {type_name && (
            <div className="flex items-center gap-2 min-w-0">
              <Tag size={15} className="text-customGreen flex-shrink-0" />
              <span className="truncate">{type_name}</span>
            </div>
          )}
        </div>

        {info && (
          <div className="flex items-start gap-2 text-sm text-gray-500 border-t border-gray-100 pt-3 min-w-0">
            <Info size={15} className="text-customGreen flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2 min-w-0">{info}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TurnajCard;
