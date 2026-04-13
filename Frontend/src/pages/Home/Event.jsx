import React, { useState, useEffect } from "react";
import config from "../../../config";

const API = config.API_URL;

function Event() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/events`)
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Načítám data...</div>;
  }

  return (
    <>
      {events.map((event) => (
        <div
          key={event.name}
          className="relative w-full h-64 rounded-lg group overflow-hidden"
        >
          <div className="card">
            <div className="h-full flex gap-2">
              <div className="flex max-w-52 w-full object-cover object-center">
                <img
                  src={`${API}${event.img_path}`}
                  alt={event.name}
                  className="object-cover object-center rounded-md"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-xl">{event.name}</span>

                <p className="flex gap-1 items-center">
                  <img
                    src="/assets/Icons/Location.png"
                    alt=""
                    className="h-5"
                  />
                  <span className="text-customGreen font-bold">Lokace:</span>
                  {event.location}
                </p>
                <p className="flex gap-1 items-center">
                  <img
                    src="/assets/Icons/Price.png"
                    alt=""
                    className="h-5"
                  />
                  <span className="text-customGreen font-bold">
                    Startovné:{" "}
                  </span>
                  {event.price}Kč
                </p>
                <p className="flex gap-1 items-center">
                  <img
                    src="/assets/Icons/Type.png"
                    alt=""
                    className="h-5"
                  />
                  <span className="text-customGreen font-bold">Typ akce: </span>
                  {event.type}
                </p>
                <p className="flex gap-1 items-center">
                  <img
                    src="/assets/Icons/Date.png"
                    alt=""
                    className="h-5"
                  />
                  <span className="text-customGreen font-bold">Datum: </span>
                  {event.date_start} - {event.date_end}
                </p>
                <br />
                <p className="flex gap-1 items-center">
                  <img
                    src="/assets/Icons/Info.png"
                    alt=""
                    className="h-5"
                  />
                  <span className="text-customGreen font-bold">
                    Informace:{" "}
                  </span>
                  {event.info}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              ZOBRAZIT DETAILY
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

export default Event;
