import { PORTFOLIO } from "@/lib/site";
import AnalisisButton from "./AnalisisButton";

export default function PortfolioDeck() {
  const featured = PORTFOLIO.filter((p) => p.featured).slice(0, 5);
  return (
    <section style={{ paddingBottom: 6 }}>
      <div className="deck-label">Destacados · pásale el cursor</div>
      <div className="deck">
        {featured.map((p) => (
          <AnalisisButton key={p.file} className="ficha">
            <div
              className="ficha-art"
              style={{ backgroundImage: `url('/portafolio/${p.file}.jpg')` }}
            />
            <div className="ficha-scrim" />
            <div className="ficha-body">
              <div className="ficha-cat">{p.badge}</div>
              <div className="ficha-title">{p.title}</div>
              <span className="ficha-btn">
                Ver <span aria-hidden="true">↗</span>
              </span>
            </div>
          </AnalisisButton>
        ))}
      </div>
    </section>
  );
}
