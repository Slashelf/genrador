import { useState } from "react";
import { authClient } from "../lib/auth-client";

export default function LoginForm({ redirectTo }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    });
    setPending(false);
    if (result.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    window.location.href = redirectTo || "/";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Correo</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          className="appearance-none relative block w-full px-3 py-3 border border-primary-300 text-gray-900 rounded-lg"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="appearance-none relative block w-full px-3 py-3 border border-primary-300 text-gray-900 rounded-lg"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 px-4 rounded-lg text-white bg-secondary-600 hover:bg-secondary-700 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
