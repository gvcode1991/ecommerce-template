import { useAdminContext } from "../contexts/AdminContext";
import { loginAdmin, validateAdminSession } from "../services/adminApi";

export function useAdminAuth() {
  const {
    adminHeaders,
    adminLogin,
    adminStatus,
    adminToken,
    adminUnlocked,
    logoutAdmin,
    setAdminLogin,
    setAdminStatus,
    setAdminToken,
    setAdminUnlocked,
  } = useAdminContext();

  function updateAdminLogin(field, value) {
    setAdminLogin((currentLogin) => ({ ...currentLogin, [field]: value }));
    setAdminUnlocked(false);
    setAdminToken("");
  }

  async function unlockAdmin(event) {
    event.preventDefault();
    setAdminStatus({ state: "loading", message: "Iniciando sesion admin..." });

    try {
      const { response, data } = await loginAdmin(adminLogin);

      if (!response.ok) {
        throw new Error(data.message || "Credenciales admin incorrectas.");
      }

      setAdminToken(data.token || "");
      setAdminUnlocked(true);
      setAdminStatus({ state: "success", message: "Panel admin desbloqueado." });
    } catch (error) {
      setAdminUnlocked(false);
      setAdminStatus({ state: "error", message: error.message });
    }
  }

  async function validateAdminSessionStatus() {
    if (!adminToken) {
      setAdminUnlocked(false);
      return false;
    }

    try {
      const { response } = await validateAdminSession({ headers: adminHeaders() });
      setAdminUnlocked(response.ok);
      return response.ok;
    } catch {
      setAdminUnlocked(false);
      return false;
    }
  }

  return {
    adminHeaders,
    adminLogin,
    adminStatus,
    adminToken,
    adminUnlocked,
    logoutAdmin,
    setAdminStatus,
    unlockAdmin,
    updateAdminLogin,
    validateAdminSessionStatus,
  };
}
