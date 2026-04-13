import React, { useState, useEffect } from "react";
import { Phone, Mail } from "lucide-react";
import config from "../../../config";

const API = config.API_URL;
const getRoleLabel = (role) => {
  switch (role) {
    case "trainer":
      return "trenér";
    default:
      return role || "";
  }
};

const CoachCard = ({ ocoach }) => {
  return (
    <div className="bg-customWhite border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col items-center gap-4">
      <div className="relative">
        <img
          src={`${API}${ocoach.img_path}`}
          alt={`${ocoach.name} ${ocoach.surname}`}
          className="rounded-full h-32 w-32 object-cover object-center ring-4 ring-customGreen/10"
        />
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl text-gray-800">
          {ocoach.name} {ocoach.surname}
        </h3>
        <p className="text-customGreen font-semibold text-sm uppercase tracking-wider">
          {ocoach.cup}
        </p>
        <p className="text-xs text-gray-400 mt-1 italic">
          {getRoleLabel(ocoach?.role_name)}
        </p>
      </div>

      <div className="w-full space-y-2 mt-2">
        {ocoach.email && (
          <a
            href={`mailto:${ocoach.email}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:border border-customGreen transition-colors group"
          >
            <div className="bg-customGreen p-2 rounded-full group-hover:scale-110 transition-transform">
              <Mail size={11} />
            </div>
            <span className="text-sm text-gray-600 truncate">
              {ocoach.email}
            </span>
          </a>
        )}
        {ocoach.phone && (
          <a
            href={`tel:+420${ocoach.phone}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:border border-customGreen transition-colors group"
          >
            <div className="bg-customGreen p-2 rounded-full group-hover:scale-110 transition-transform">
              <Phone size={11} />
            </div>
            <span className="text-sm text-gray-600">+420 {ocoach.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
};

function MainContact() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/users/trainer`)
      .then((response) => response.json())
      .then((data) => {
        setCoaches(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-customGreen"></div>
        <span className="ml-3 text-gray-500 font-medium">
          Načítám trenéry...
        </span>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coaches.map((coach) => (
          <CoachCard key={coach.id || coach.email} ocoach={coach} />
        ))}
      </div>
    </div>
  );
}

export default MainContact;
