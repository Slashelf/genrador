import { authClient } from "../lib/auth-client";

export default function LogoutButton({ className = "" }) {
  async function logout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <button type="button" onClick={logout} className={className}>
      Cerrar sesión
    </button>
  );
}
