import { NavLink } from "react-router-dom";
import "../styles/navBar.css";

const NavBar = () => {
  return (
    <header className="navbar">
      <div className="navbar__logo">Saint</div>

      <nav className="navbar__menu">
        <button className="navbar__link">Nuevo</button>
        <button className="navbar__link">Hombre</button>

        <div className="navbar__menu-item navbar__menu-item--has-dropdown">
          <NavLink
            to="/women"
            className={({ isActive }) =>
              isActive
                ? "navbar__link navbar__link--active"
                : "navbar__link"
            }
          >
            Mujer
          </NavLink>

          <div className="navbar__dropdown">
            <NavLink to="/women" className="navbar__dropdown-link">
              Ver todo
            </NavLink>
            <NavLink to="/women/superior" className="navbar__dropdown-link">
              Superior
            </NavLink>
            <NavLink to="/women/inferior" className="navbar__dropdown-link">
              Inferior
            </NavLink>
          </div>
        </div>

        <button className="navbar__link">Accesorios</button>
      </nav>

      <div className="navbar__icons">
        <svg
          className="navbar__icon-svg"
          viewBox="0 0 24 24"
        >
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M4 19v-2a4 4 0 0 1 3-3.87" />
          <circle cx="12" cy="7" r="4" />
        </svg>

        <svg
          className="navbar__icon-svg"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <svg
          className="navbar__icon-svg"
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
    </header>
  );
};

export default NavBar;
