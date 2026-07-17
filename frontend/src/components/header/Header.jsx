import { useState } from "react";
import "./header.css";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = ({ isAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header">
      <NavLink to="/" className="logo" onClick={closeMenu}>E-Learning</NavLink>

      <button
        type="button"
        className="header-menu-button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`link ${isOpen ? "link-open" : ""}`} aria-label="Main navigation">
        <NavLink to="/" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/courses" onClick={closeMenu}>Courses</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        {isAuth ? (
          <NavLink to="/account" onClick={closeMenu}>Account</NavLink>
        ) : (
          <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
        )}
      </nav>
    </header>
  );
};

export default Header;
