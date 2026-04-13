import config from "../../config";

const API_URL = config.API_URL;

export const authService = {
  async login(login, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Přihlášení selhalo");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Chyba při načítání uživatele:", error);
      return null;
    }
  },
};

export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}
