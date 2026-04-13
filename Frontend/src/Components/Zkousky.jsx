import React, { useState } from "react";
import Cenik from "../pages/Zkousky/Cenik";
import Video from "../pages/Zkousky/Video";
import SestavyInfo from "../pages/Zkousky/SestavyInfo";
import Prihlasky from "../pages/Zkousky/Prihlasky";

function Zkousky() {
  const [selectedBelt, setSelectedBelt] = useState(null);

  return (
    <>
      <div className="devider">ZKOUŠKY</div>

      <Cenik onSelectBelt={setSelectedBelt} />

      {selectedBelt && (
        <div className="flex flex-col lg:flex-row gap-5">
          <Video belt={selectedBelt} />
          <SestavyInfo belt={selectedBelt} />
        </div>
      )}

      <Prihlasky />
    </>
  );
}

export default Zkousky;
