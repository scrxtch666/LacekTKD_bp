import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Image,
  ShieldAlert,
  LogOut,
  User,
  BookCheckIcon,
  Swords,
  Landmark,
  ChevronRight,
} from "lucide-react";
import { getUserRole, authService } from "../utils/auth";
import config from "../../config";

const API = config.API_URL;

function SideBar() {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = getUserRole();

  useEffect(() => {
    authService.getCurrentUser().then((data) => setCurrentUser(data));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrátor";
      case "trainer":
        return "Trenér";
      case "user":
        return "Závodník";
      default:
        return role || "";
    }
  };

  const sections = [
    {
      title: "Obecné",
      adminOnly: true,
      items: [
        { name: "Můj účet", path: "/admin/me", icon: User },
        { name: "Aktuality", path: "/admin/aktuality", icon: LayoutDashboard },
        { name: "Zkoušky", path: "/admin/zkousky", icon: BookCheckIcon },
        { name: "Turnaje", path: "/admin/turnaje", icon: Swords },
        { name: "Závodníci", path: "/admin/zavodnici", icon: Users },
      ],
    },
    {
      title: "Správa webu",
      adminOnly: true,
      items: [
        { name: "Banner", path: "/admin/banner", icon: Image },
        { name: "Sponzoři", path: "/admin/sponsors", icon: Landmark },
        { name: "Uživatelé", path: "/admin/users", icon: Users },
        { name: "Žádosti", path: "/admin/zadosti", icon: Users },
      ],
    },
    {
      title: "Uživatelské možnosti",
      userOnly: true,
      items: [
        { name: "Můj účet", path: "/admin/me", icon: User },
        { name: "Zkoušky", path: "/admin/zkousky", icon: BookCheckIcon },
        { name: "Turnaje", path: "/admin/turnaje", icon: Swords },
      ],
    },
    {
      title: "Trenérské možnosti",
      trainerOnly: true,
      items: [
        { name: "Můj účet", path: "/admin/me", icon: User },
        { name: "Aktuality", path: "/admin/aktuality", icon: LayoutDashboard },
        { name: "Zkoušky", path: "/admin/zkousky", icon: BookCheckIcon },
        { name: "Turnaje", path: "/admin/turnaje", icon: Swords },
        { name: "Závodníci", path: "/admin/zavodnici", icon: Users },
      ],
    },
  ];

  const visibleSections = sections.filter((section) => {
    if (section.adminOnly && userRole !== "admin") return false;
    if (section.userOnly && userRole !== "user") return false;
    if (section.trainerOnly && userRole !== "trainer") return false;
    return true;
  });

  const initials =
    currentUser?.name && currentUser?.surname
      ? `${currentUser.name.charAt(0)}${currentUser.surname.charAt(0)}`
      : currentUser?.login?.charAt(0).toUpperCase() || "?";

  const SidebarContent = () => (
    <div className="w-64 h-full flex flex-col text-white bg-customGreen">
      <div className="flex items-center justify-between px-5 py-4 border-b border-green-600 flex-shrink-0">
        <Link
          to="/"
          className="text-lg font-bold tracking-wide hover:text-green-200 transition-colors"
        >
          LacekTKD
        </Link>
        <button
          className="lg:hidden p-1 text-green-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-1.5 px-2 mb-1.5">
              {section.adminOnly && (
                <ShieldAlert size={11} className="text-green-300 opacity-60" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-300 opacity-60">
                {section.title}
              </span>
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium
                      ${
                        isActive
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-green-100 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <ChevronRight size={14} className="opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-green-600 p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-1">
          {currentUser?.img_path ? (
            <img
              src={`${API}${currentUser.img_path}`}
              alt={currentUser.login}
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {currentUser?.name && currentUser?.surname
                ? `${currentUser.name} ${currentUser.surname}`
                : currentUser?.login || "..."}
            </p>
            <p className="text-xs text-green-300 opacity-80 truncate">
              {getRoleLabel(currentUser?.role)}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 p-1.5 rounded-lg text-green-200 hover:bg-white/10 hover:text-white transition-colors"
            title="Odhlásit se"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Zobrazení na mobilu */}
      <div className="lg:hidden fixed bg-customGreen top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 shadow-md">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={22} />
        </button>
        <span className="text-white font-semibold text-sm">LacekTKD</span>

        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs">
          {initials}
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
          lg:hidden fixed top-0 left-0 h-full w-64 z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </div>

      {/* PC */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-64 lg:z-30">
        <SidebarContent />
      </div>
    </>
  );
}

export default SideBar;
