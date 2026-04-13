function Add() {
  return (
    <>
      <div className="card w-full">
        <span className="font-bold uppercase">Rychlé přidání</span>
        <hr />
        <div className="h-full flex items-center justify-between gap-2">
          <button className="flex w-full rounded-lg p-2 border-2 border-customBlack justify-evenly">
            <div className="bg-customGreen rounded-full w-6">
              <img className="" src="/assets/Icons/plus.png" alt="Logo" />
            </div>
            Přidat závodníka
          </button>

          <button className="flex w-full rounded-lg p-2 border-2 border-customBlack justify-evenly">
            <div className="bg-customGreen rounded-full w-6">
              <img className="" src="/assets/Icons/plus.png" alt="Logo" />
            </div>
            Přidat akci
          </button>
          <button className="flex w-full rounded-lg p-2 border-2 border-customBlack justify-evenly">
            <div className="bg-customGreen rounded-full w-6">
              <img className="" src="/assets/Icons/plus.png" alt="Logo" />
            </div>
            Přidat aktualitu
          </button>
        </div>
      </div>
    </>
  );
}

export default Add;
