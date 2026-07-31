import type { Metadata } from "next";
import { listLeads, listAnalisis, dashboardStats } from "@/lib/admin";
import { listCreadores } from "@/lib/creadores";
import AdminLeads from "@/components/admin/AdminLeads";
import AdminCreadores, { type CreadorLite } from "@/components/admin/AdminCreadores";
import AdminLogout from "@/components/admin/AdminLogout";
import AdminSection from "@/components/admin/AdminSection";

export const metadata: Metadata = {
  title: "Panel · Bushido",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

function Bars({ items }: { items: Array<{ name: string; count: number }> }) {
  if (!items.length) return <p className="admin-empty">Sin datos aún.</p>;
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="admin-bars">
      {items.map((i) => (
        <div className="admin-bar" key={i.name}>
          <span className="ab-name">{i.name}</span>
          <span className="ab-track">
            <span className="ab-fill" style={{ width: `${(i.count / max) * 100}%` }} />
          </span>
          <span className="ab-count">{i.count}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  let error = "";
  let stats = null;
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let analisis: Array<Record<string, unknown>> = [];
  let creadores: CreadorLite[] = [];
  try {
    [stats, leads, analisis, creadores] = await Promise.all([
      dashboardStats(),
      listLeads(100),
      listAnalisis(50),
      listCreadores({ limit: 300 }) as Promise<CreadorLite[]>,
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error cargando datos.";
  }

  return (
    <main className="admin">
      <header className="admin-head">
        <span className="admin-brand">
          BUSH<em>I</em>DO <span>· Panel</span>
        </span>
        <AdminLogout />
      </header>

      {error && <p className="admin-error">No se pudieron cargar los datos: {error}</p>}

      {stats && (
        <section className="admin-overview">
          {/* KPIs */}
          <div className="admin-kpis">
            <div className="kpi">
              <span className="kpi-n">{stats.leadsTotal}</span>
              <span className="kpi-l">Leads</span>
            </div>
            <div className="kpi">
              <span className="kpi-n">{stats.analisisTotal}</span>
              <span className="kpi-l">Análisis</span>
            </div>
            <div className="kpi">
              <span className="kpi-n">{stats.eventosTotal}</span>
              <span className="kpi-l">Eventos</span>
            </div>
            <div className="kpi kpi-wide">
              <span className="kpi-l">Leads por estado</span>
              <div className="kpi-tags">
                {Object.entries(stats.porEstado).map(([k, v]) => (
                  <span key={k} className={"kpi-tag s-" + k}>
                    {k} <b>{v}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Analítica de interés */}
          <div className="admin-analytics">
            <div className="admin-panel">
              <h3>Servicios más mirados</h3>
              <Bars items={stats.topServicios} />
            </div>
            <div className="admin-panel">
              <h3>CTAs más clickeados</h3>
              <Bars items={stats.topCtas} />
            </div>
            <div className="admin-panel">
              <h3>Páginas más vistas</h3>
              <Bars items={stats.topPaginas} />
            </div>
          </div>
        </section>
      )}

      <AdminSection title="Book de creadores" count={creadores.length} hint="Privado · castings por nicho">
        <AdminCreadores creadores={creadores} />
      </AdminSection>

      <AdminSection title="Leads" count={leads.length} defaultOpen hint="Solicitudes que entraron">
        <AdminLeads leads={leads} />
      </AdminSection>

      <AdminSection title="Análisis generados" count={analisis.length} hint="Informes Kansei enviados">
        {analisis.length === 0 ? (
          <p className="admin-empty">Aún no hay análisis. Genera uno desde un lead ↑</p>
        ) : (
          <div className="admin-analisis">
            {analisis.map((a) => (
              <a
                key={a.id as string}
                href={`/informe/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-ana-row"
              >
                <strong>{(a.marca as string) || "—"}</strong>
                {a.categoria ? <span className="ana-cat">{a.categoria as string}</span> : null}
                <span>{(a.nicho as string) || ""}</span>
                <span className="ana-arrow">Ver informe →</span>
              </a>
            ))}
          </div>
        )}
      </AdminSection>
    </main>
  );
}
