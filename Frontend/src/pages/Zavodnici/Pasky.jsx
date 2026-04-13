import React, { useState, useEffect } from "react";
import config from "../../../config";
function Pasky() {
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
    return <div>Načítám data...</div>; 
  }
  return (
      <div className="hidden sm:flex devider">
        {belts.map((belt) => (
          <img src={belt.img_path} alt={belt.belt_name} className="w-9" />
        ))}
      </div>
    
  );
}

export default Pasky;
