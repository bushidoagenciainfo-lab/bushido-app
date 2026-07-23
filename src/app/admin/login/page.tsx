"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get("next") || "/admin";
        window.location.href = next;
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo entrar.");
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="al-brand">
          BUSH<em>I</em>DO
        </div>
        <div className="al-title">Panel · acceso</div>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="al-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
