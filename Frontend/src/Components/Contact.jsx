import React from "react";
import MainContact from "../pages/Kontakty/MainContact";
import TimeTable from "../pages/Kontakty/TimeTable";
import Map from "../pages/Kontakty/Map";
function Contact() {
  return (
    <>
      <div className="devider">kontakt</div>
      <div class="flex justify-between gap-5">
        <MainContact />
      </div>

      <div className="devider">Informace k tréninkům</div>

      <div class="flex gap-5">
        <TimeTable />
        <Map />
      </div>
    </>
  );
}

export default Contact;
