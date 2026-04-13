import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import config from "../../../config";

function Cenik({ onSelectBelt }) {
  const [belts, setBelts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = config.API_URL;

  useEffect(() => {
    fetch(`${API}/api/belts`)
      .then((response) => response.json())
      .then((data) => {
        setBelts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10">Načítám data...</div>;
  }

  return (
    <div className="card w-full p-4">
      <h2 className="font-extrabold mb-6 uppercase">
        Pásky a ceník
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {belts.map((belt) => (
          <div
            key={belt.id}
            onClick={() => onSelectBelt(belt)}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-xl shadow-sm"
          >
            <img
              src={belt.img_path}
              alt={belt.czech_name}
              className="w-16 h-16 object-contain"
            />

            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">- {belt.cup} -</p>
              <p className="font-bold">{belt.belt_name}</p>
              <p className="font-semibold text-customGreen">
                {belt.price} Kč
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cenik;