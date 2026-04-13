import AddButton from "../pages/AddFighter/AddButton";
import FightersAdminTable from "./FightersAdminTable";
import Stats from "../pages/_Admin/Stats";

function FightersAdmin() {
  return (
    <>
      <div className="flex gap-5 items-center">
        <div className="flex justify-center content-center align-middle items-center bg-customWhite w-16 h-16 rounded-md border-2 border-customGreen">
          <img
            className="px-0.6 py-0.6"
            src="/assets/Icons/fighters.png"
            alt="Login"
          />
        </div>

        <span className="devider w-1/5">Všichni závodníci</span>

        <span className="devider w-1/5">Přidat závodníka</span>
      </div>

      <div className="devider">Všichni závodníci</div>
      <AddButton />
      <div className="flex justify-center">
        <div className="w-1/2 flex justify-center">
          <Stats />
        </div>
      </div>

      <input
        name="myInput  "
        className="bg-customWhite rounded-md p-2 w-1/5 text-gray-800 text-xs"
        placeholder="Vyhledat závodníka, ↵ hledat"
      />

      <FightersAdminTable />

      <div className="bg-customWhite">
        <img
          className="px-0.5 py-0.5 flex align-middle items-center"
          src="/assets/Icons/yes_1.png"
          alt="image description"
        ></img>

        <img
          className="px-0.5 py-0.5 flex align-middle items-center"
          src="/assets/Icons/no_1.png"
          alt="image description"
        ></img>
      </div>
   
    </>
  );
}

export default FightersAdmin;
