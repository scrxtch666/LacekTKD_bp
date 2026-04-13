import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

 const API = config.API_URL;

const EventCardSingle = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/aktualita/${event.id}`)}
      className="w-full overflow-hidden bg-pink-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        {event.cover_photo ? (
          <img
            src={`${API}${event.cover_photo}`}
            alt={event.title}
            className="w-full h-52 object-cover object-center"
          />
        ) : (
          <div className="w-full h-52 bg-customGreen flex items-center justify-center text-white text-2xl font-bold">
            {event.title}
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-customWhite">
        <div className="flex justify-between gap-5 text-sm font-medium text-gray-700">
          <p className="font-medium">{event.title}</p>
          <p className="text-customGreen font-medium">{event.date_start}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCardSingle;