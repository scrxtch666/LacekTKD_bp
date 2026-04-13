import React from "react";
function SestavyInfo({ belt }) {
  if (!belt) return null;
  return (
    <>
      <div className="card w-full p-4">
        <h2 className="font-extrabold text-lg mb-3">{belt.belt_name}</h2>
        <p className="whitespace-pre-line"> {belt.info} </p>
      </div>
    </>
  );
}
export default SestavyInfo;
