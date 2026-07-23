"use client";

export default function AdminLogout() {
  async function salir() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }
  return (
    <button type="button" className="admin-logout" onClick={salir}>
      Salir
    </button>
  );
}
