import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, Search } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="relative">
        <p className="text-[120px] font-black text-gray-100 leading-none select-none">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search size={48} className="text-customGreen opacity-80" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Stránka nenalezena</h1>
        <p className="text-gray-500 max-w-sm">
          Stránka{" "}
          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
            {location.pathname}
          </span>{" "}
          neexistuje nebo byla přesunuta.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Zpět
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 bg-customGreen hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
        >
          <Home size={16} /> Domů
        </button>
      </div>
    </div>
  );
}

export default NotFound;
