import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

const API = config.API_URL;

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/aktualita/${event.id}`)}
      className="w-full overflow-hidden bg-pink-50 rounded-2xl shadow-xl cursor-pointer"
    >
      <div className="relative">
        {event.cover_photo ? (
          <img
            src={`${API}${event.cover_photo}`}
            alt={event.title}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-customGreen flex items-center justify-center text-white text-2xl font-bold">
            {event.title}
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-customWhite">
        <div className="flex justify-between gap-5 text-sm">
          <p className="text-customBlack font-medium">{event.title}</p>
          <p className="text-customGreen font-medium">{event.date_start}</p>
        </div>
      </div>
    </div>
  );
};

const EventCardLatest = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/events/latest`)
      .then((res) => res.json())
      .then((data) => {
        setNews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Načítám...</div>;
  if (news.length === 0)
    return (
      <div className="card w-full p-10 text-center border-2 border-dashed">
        <p className="text-gray-500">
          Momentálně nejsou naplánovány žádné akce.
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {news.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventCardLatest;
