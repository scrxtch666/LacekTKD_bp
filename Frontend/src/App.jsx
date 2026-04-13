import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Container from "./layout/Container";
import Zavodnici from "./Components/Zavodnici";
import Contact from "./Components/Contact";
import Aktuality from "./Components/Aktuality";
import Zkousky from "./Components/Zkousky";
import Home from "./Components/Home";
import Turnaje from "./Components/Turnaje";
import AboutUs from "./Components/AboutUS";
import SideBar from "./layout/Sidebar";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ProtectedRoute from "./pages/Login/ProtectedRoute";
import AdminBanner from "./pages/_Admin/AdminBanner";
import AdminAktuality from "./pages/_Admin/AdminAktuality";
import AdminUsers from "./pages/_Admin/AdminUsers";
import AdminSponsors from "./pages/_Admin/AdminSponsors";
import AdminZavodnici from "./pages/_Admin/AdminZavodnici";
import AdminTurnaje from "./pages/_Admin/AdminTurnaje";
import AdminMe from "./pages/_Admin/AdminMe";
import AktualitaDetail from "./pages/Home/AktualitaDetail";
import TurnajDetail from "./pages/Turnaje/TurnajDetail";
import AdminRequests from "./pages/_Admin/AdminRequests";
import FighterDetail from "./pages/Zavodnici/FighterDetail";
import AdminZkousky from "./pages/_Admin/AdminZkousky";
import Gdpr from "./pages/Login/Gdpr";
import NotFound from "./pages/Login/NotFound";
import ScrollToTop from "./Components/ScrollToTop";

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      // Chráněné admin routy
      <div className="flex min-h-screen">
        <SideBar />

        <main className="pt-14 lg:pt-0 lg:ml-64 min-h-screen w-full">
          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="*" element={<NotFound />} />

              <Route
                path="/admin/me"
                element={
                  <ProtectedRoute allowedRoles={["admin", "trainer", "user"]}>
                    <AdminMe />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/zavodnici"
                element={
                  <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                    <AdminZavodnici />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/zkousky"
                element={
                  <ProtectedRoute allowedRoles={["admin", "trainer", "user"]}>
                    <AdminZkousky />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/turnaje"
                element={
                  <ProtectedRoute allowedRoles={["admin", "trainer", "user"]}>
                    <AdminTurnaje />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/aktuality"
                element={
                  <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                    <AdminAktuality />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/banner"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminBanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/zadosti"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/sponsors"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSponsors />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    );
  }

  // Veřejné routy
  return (
    <>
      <Header />
      <Container>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/turnaje" element={<Turnaje />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/zavodnici" element={<Zavodnici />} />
          <Route path="/aktuality" element={<Aktuality />} />
          <Route path="/zkousky" element={<Zkousky />} />
          <Route path="/nas-oddil" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aktualita/:id" element={<AktualitaDetail />} />
          <Route path="/turnaj/:id" element={<TurnajDetail />} />
          <Route path="/zavodnik/:id" element={<FighterDetail />} />
          <Route path="/gdpr" element={<Gdpr />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
