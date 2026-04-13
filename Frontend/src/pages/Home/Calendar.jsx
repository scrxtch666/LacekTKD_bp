import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar as CalendarIcon,
  Trophy,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../../utils/auth";
import config from "../../../config";

const API = config.API_URL;

const MONTHS_CZ = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];
const DAYS_CZ = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const [tournaments, setTournaments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userRole = getUserRole();

  useEffect(() => {
    fetchTournaments();
  }, [currentYear, currentMonth]);

  const fetchTournaments = async () => {
    setLoading(true);
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [tourRes, examRes] = await Promise.all([
        fetch(`${API}/api/tournaments/calendar?month=${monthStr}`, { headers }),
        fetch(`${API}/api/exams/calendar?month=${monthStr}`, { headers }),
      ]);

      const tourData = await tourRes.json();
      const examData = await examRes.json();

      setTournaments(Array.isArray(tourData) ? tourData : []);
      setExams(Array.isArray(examData) ? examData : []);
    } catch {
      setTournaments([]);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDay = (dateStr) => {
    const tours = tournaments.filter((t) => {
      const start = t.start_date?.substring(0, 10);
      const end = t.end_date?.substring(0, 10) || start;
      return dateStr >= start && dateStr <= end;
    });

    const examEvents = exams.filter(
      (e) => e.start_date?.substring(0, 10) === dateStr,
    );

    return { tours, exams: examEvents };
  };

  const { tours: selectedTours, exams: selectedExams } =
    getEventsForDay(selectedDate);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const todayStr = toDateStr(today);

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatSelectedDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <div className="bg-customWhite rounded-2xl shadow-md p-5 w-full lg:w-80 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth}>
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-800">
            {MONTHS_CZ[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth}>
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS_CZ.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-gray-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const { tours, exams: dayExams } = getEventsForDay(dateStr);
            const hasTournament = tours.length > 0;
            const hasExam = dayExams.length > 0;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  relative flex flex-col items-center justify-center w-9 h-9 mx-auto rounded-full text-sm font-medium transition-all duration-150
                  ${
                    isSelected
                      ? "bg-green-600 text-white shadow-md"
                      : isToday
                        ? "bg-green-100 text-green-800 font-bold"
                        : "text-gray-700 hover:border-customGreen border"
                  }
                `}
              >
                {day}
                {hasTournament &&
                  !isSelected &&
                  (() => {
                    const hasUncompleted = tours.some(
                      (t) => t.status === "uncompleted",
                    );
                    const hasCompleted = tours.some(
                      (t) => t.status === "completed",
                    );
                    return (
                      <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          hasUncompleted && !hasCompleted
                            ? "bg-orange-400"
                            : hasUncompleted && hasCompleted
                              ? "bg-yellow-400"
                              : "bg-green-500"
                        }`}
                      />
                    );
                  })()}
                {hasTournament && isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
                )}
                {hasExam && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Turnaj / soustředění
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Zkoušky
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-200 inline-block" />
            Dnes
          </span>
        </div>
      </div>

      <div className="flex-1 bg-customWhite rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <CalendarIcon size={20} className="text-green-600 flex-shrink-0" />
          <h3 className="text-base font-semibold text-gray-800 capitalize">
            {formatSelectedDate(selectedDate)}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Načítám...
          </div>
        ) : selectedTours.length === 0 && selectedExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Trophy size={32} className="mb-2 opacity-30" />
            <p className="text-sm">V tento den není žádná akce</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedTours.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() => navigate(`/turnaj/${tournament.id}`)}
                className={`flex gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  tournament.status === "uncompleted"
                    ? "border-orange-200 bg-orange-50 hover:border-orange-400"
                    : "border-gray-100 hover:border-customGreen hover:shadow-sm"
                }`}
              >
                <div className="flex-shrink-0">
                  {tournament.img_path ? (
                    <img
                      src={`${API}${tournament.img_path}`}
                      alt={tournament.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                        tournament.status === "uncompleted"
                          ? "bg-orange-100"
                          : "bg-green-100"
                      }`}
                    >
                      <Trophy
                        size={24}
                        className={
                          tournament.status === "uncompleted"
                            ? "text-orange-500"
                            : "text-green-600"
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {tournament.name}
                    </h4>
                    {tournament.type_name && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                        {tournament.type_name}
                      </span>
                    )}
                    {tournament.status === "uncompleted" &&
                      (userRole === "admin" || userRole === "trainer") && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600 font-medium">
                          ○ Nezveřejněný
                        </span>
                      )}
                  </div>

                  <div className="space-y-1">
                    {tournament.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {tournament.location}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarIcon size={12} className="text-gray-400" />
                      {new Date(
                        tournament.start_date + "T00:00:00",
                      ).toLocaleDateString("cs-CZ")}
                      {tournament.end_date &&
                        tournament.end_date !== tournament.start_date && (
                          <>
                            {" "}
                            –{" "}
                            {new Date(
                              tournament.end_date + "T00:00:00",
                            ).toLocaleDateString("cs-CZ")}
                          </>
                        )}
                    </p>
                    {tournament.price && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="text-gray-400 font-bold">Kč</span>
                        Startovné: {tournament.price} Kč
                      </p>
                    )}
                    {tournament.info && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Info
                          size={12}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="line-clamp-2">{tournament.info}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {selectedExams.length > 0 && (
              <div className="space-y-3 mt-2">
                {selectedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex gap-4 p-4 rounded-xl border border-red-100 bg-red-50 hover:border-red-300 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
                        <Trophy size={24} className="text-red-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {exam.name}
                      </h4>
                      <div className="space-y-1 mt-1">
                        {exam.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} /> {exam.location}
                          </p>
                        )}
                        {exam.price && (
                          <p className="text-xs text-gray-500">
                            Startovné: {exam.price} Kč
                          </p>
                        )}
                        {(userRole === "admin" || userRole === "trainer") &&
                          exam.status === "hidden" && (
                            <span className="text-xs text-orange-500">
                              ○ Skrytá
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
