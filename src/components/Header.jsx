import { Link, NavLink } from "react-router-dom";
import { IconLibro } from "./Icons.jsx";

const enlaces = [
  { to: "/", texto: "Inicio", end: true },
  { to: "/perfil", texto: "Mi perfil" },
  { to: "/becas", texto: "Becas" },
  { to: "/asistente", texto: "Asistente IA" },
  { to: "/progreso", texto: "Mi progreso" },
  { to: "/recursos", texto: "Recursos" },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="nav">
        <Link className="logo" to="/" aria-label="BecaLink, inicio">
          <IconLibro width="34" height="34" />
          BecaLink
        </Link>
        <nav aria-label="Principal">
          <ul className="nav-links">
            {enlaces.map((e) => (
              <li key={e.to}>
                {/* NavLink agrega aria-current="page" a la ruta activa */}
                <NavLink to={e.to} end={e.end}>
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
