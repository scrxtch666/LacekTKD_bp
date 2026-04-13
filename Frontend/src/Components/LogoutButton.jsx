import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    
    navigate("/", { replace: true });

    window.location.reload();
  };

  return (
    <button 
      onClick={handleLogout}
      className="logout-button text-customGreen bg-customWhite font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-customWhite flex items-center space-x-1 border border-customGreen"
    >
      Odhlásit se
    </button>
  );
};

export default LogoutButton;