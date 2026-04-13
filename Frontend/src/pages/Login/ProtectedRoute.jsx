import { Navigate } from "react-router-dom";
import { getUserRole } from "../../utils/auth";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = getUserRole();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;