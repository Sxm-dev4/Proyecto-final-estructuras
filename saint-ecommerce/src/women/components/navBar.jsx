import { NavLink } from "react-router-dom";
import "../styles/navBar.css";

const navLinkClass = ({ isActive }) =>
  isActive ? "navbar__link navbar__link--active" : "navbar__link";

function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar__logo">Saint</div>

      <nav className="navbar__menu">
        <NavLink to="/nuevo" className={navLinkClass}>
          Nuevo
        </NavLink>
        <NavLink to="/hombre" className={navLinkClass}>
          Hombre
        </NavLink>
        <NavLink to="/women" className={navLinkClass}>
          Mujer
        </NavLink>
        <NavLink to="/accesorios" className={navLinkClass}>
          Accesorios
        </NavLink>
      </nav>

      <div className="navbar__icons">
        <button aria-label="Perfil">👤</button>
        <button aria-label="Buscar">🔍</button>
        <button aria-label="Carrito">🛒</button>
      </div>
    </header>
  );
}

export default NavBar;
