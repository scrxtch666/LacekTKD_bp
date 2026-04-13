import { Link } from "react-router-dom";

function Nabor() {
  return (
    <button
      type="button"
      className="hidden xl:flex items-center justify-center gap-3 px-4 h-9 text-customGreen bg-customWhite rounded-lg border border-customGreen text-sm font-semibold whitespace-nowrap"
    >
      <Link to="/register" className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-customGreen opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-customGreen"></span>
        </span>

        <span>NÁBOR OTEVŘEN</span>
      </Link>
    </button>
  );
}

export default Nabor;