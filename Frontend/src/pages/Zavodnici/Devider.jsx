import { useState, useEffect } from "react";
import config from "../../../config";

function Devider() {
  const [count, setCount] = useState(null);

  const API = config.API_URL;
  useEffect(() => {
    fetch(`${API}/api/fighters/countAll`)
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch((error) => console.error("Chyba při načítání:", error));
  }, []);

  return (
    <div className="devider">
      <div className="justify-center align-middle content-center flex items-center gap-2">
        <img
          src="/assets/Belts/blt_black_2.gif"
          alt="2 DAN"
          className="w-9"
        />
        <span className="">2. DAN</span>
      </div>
      <div className="justify-center align-middle content-center gap-2 flex items-center">
        <span>ZÁVODNÍCI:</span>
        <span className="text-customGreen">
          {count !== null ? count : "Načítám..."}
        </span>
      </div>
    </div>
  );
}

export default Devider;
