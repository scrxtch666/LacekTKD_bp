import React from "react";
import config from "../../../config";

const API = config.API_URL;

function CalendarTournament({ tournaments }) {
  if (tournaments.length === 0) {
    return (
      <div className="card w-full p-10 text-center border-2 border-dashed rounded-2xl bg-customWhite">
        <p className="text-gray-500 font-medium">
          Na tento den nejsou naplánovány žádné akce.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          className="card w-full flex items-center overflow-hidden h-64 bg-customWhite rounded-2xl p-4 shadow-sm border border-[#e8dfd3]"
        >
          <div className="flex gap-4 h-full w-full">
            <div className="flex w-44 max-w-44 h-full items-center justify-center overflow-hidden shrink-0 hidden sm:flex">
              <img
                src={`${API}${tournament.img_path}`}
                alt={tournament.name}
                className="object-cover w-full h-full rounded-md shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <span className="font-extrabold text-2xl uppercase text-gray-800">
                {tournament.tournament_name || tournament.name}
              </span>

              <div className="space-y-1">
                <p className="flex gap-2 items-center">
                  <img
                    src="/assets/Icons/Location.png"
                    alt=""
                    className="h-5"
                  />
                  <span className="text-customGreen font-bold">Lokace:</span>
                  {tournament.location}
                </p>
                <p className="flex gap-2 items-center">
                  <img src="/assets/Icons/Price.png" alt="" className="h-5" />
                  <span className="text-customGreen font-bold">Startovné:</span>
                  {tournament.price}Kč
                </p>
                <p className="flex gap-2 items-center">
                  <img src="/assets/Icons/Type.png" alt="" className="h-5" />
                  <span className="text-customGreen font-bold">Typ akce:</span>
                  {tournament.type_name}
                </p>
                <p className="flex gap-2 items-center">
                  <img src="/assets/Icons/Date.png" alt="" className="h-5" />
                  <span className="text-customGreen font-bold">Datum:</span>
                  {tournament.start_date} - {tournament.end_date}
                </p>
                <p className="flex gap-2 items-center mt-2">
                  <img src="/assets/Icons/Info.png" alt="" className="h-5" />
                  <span className="text-customGreen font-bold">Informace:</span>
                  {tournament.info}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CalendarTournament;
