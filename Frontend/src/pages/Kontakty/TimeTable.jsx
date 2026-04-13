import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigovat from "./Navigovat";
import config from "../../../config";



const DAY_MAP = {
  pondeli: 1,
  utery: 2,
  streda: 3,
  ctvrtek: 4,
  patek: 5,
  sobota: 6,
  nedele: 0,
  pondělí: 1,
  úterý: 2,
  středa: 3,
  čtvrtek: 4,
  pátek: 5,
};

function Otevreno({ trainings }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkOpeningHours = () => {
      if (!trainings || trainings.length === 0) {
        setIsOpen(false);
        return;
      }

      const now = new Date();
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const todayTrainings = trainings.filter((t) => {
        const start = DAY_MAP[t.day_start?.toLowerCase()];
        const end = DAY_MAP[t.day_end?.toLowerCase()];
        if (start === undefined || end === undefined) return false;
        if (start <= end) return currentDay >= start && currentDay <= end;
        return currentDay >= start || currentDay <= end;
      });

      if (todayTrainings.length === 0) {
        setIsOpen(false);
        return;
      }

      const earliestStart = Math.min(
        ...todayTrainings.map((t) => {
          const [h, m] = (t.time_start || "0:0").split(":").map(Number);
          return h * 60 + m;
        }),
      );
      const latestEnd = Math.max(
        ...todayTrainings.map((t) => {
          const [h, m] = (t.time_end || "0:0").split(":").map(Number);
          return h * 60 + m;
        }),
      );

      setIsOpen(currentMinutes >= earliestStart && currentMinutes < latestEnd);
    };

    checkOpeningHours();
    const interval = setInterval(checkOpeningHours, 60000);
    return () => clearInterval(interval);
  }, [trainings]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-3 w-3 items-center justify-center">
        {isOpen ? (
          <>
            <div className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-customGreen opacity-75"></div>
            <div className="relative inline-flex rounded-full h-2 w-2 bg-customGreen"></div>
          </>
        ) : (
          <div className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></div>
        )}
      </div>
      <span
        className={`text-xs font-semibold ${isOpen ? "text-customGreen" : "text-red-500"}`}
      >
        {isOpen ? "Trénujeme" : "Odpočíváme"}
      </span>
    </div>
  );
}

function TimeTable() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = config.API_URL;

  const fetchTrainings = () => {
    fetch(`${API}/api/trainings`)
      .then((res) => res.json())
      .then((data) => {
        setTrainings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Chyba:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrainings();
    const interval = setInterval(fetchTrainings, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Načítám data...</div>;

  return (
    <div className="bg-customWhite rounded-lg p-6 flex flex-col gap-4 w-full lg:w-1/3 shrink-0">
      <span className="font-bold text-2xl">Informace k tréninkům</span>

      <div className="flex justify-between items-center">
        <span className="font-bold text-xl">Tréninky</span>
        <Otevreno trainings={trainings} />
      </div>

      <div className="flex flex-col gap-2">
        {trainings.map((training, index) => (
          <div
            key={index}
            className="flex justify-between items-center gap-2 text-sm"
          >
            <span className="whitespace-nowrap">
              {training.day_start} - {training.day_end}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {training.type}
            </span>
            <span className="whitespace-nowrap">
              {training.time_start} - {training.time_end}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <span className="font-bold text-xl">Adresa</span>
        <span>SK TAEKWONDO LACEK z.s.</span>
        <p>Tř. Legií 1115</p>
        <p>393 01 PELHŘIMOV</p>
      </div>
      <Navigovat />
    </div>
  );
}

export default TimeTable;
