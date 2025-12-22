import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const authToken = localStorage.getItem("jwtToken");
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src="/task-manager-logo.png" style={{ height: "40px", width: "40px" }} alt="Task Manager Logo" />
        <Link to="/">
          <span className="logo-primary">Task</span>
          <span className="logo-secondary">Manager</span>
        </Link>
      </div>

      {/* Links */}
      <ul className="navbar-links">
        <li className={isActive("/") ? "active" : ""}>
          <a href="#home">Home</a>
        </li>
        <li className={isActive("/about") ? "active" : ""}>
          <a href="#about">About</a>
        </li>
        <li className={isActive("/services") ? "active" : ""}>
          <a href="#services">Services</a>
        </li>
        <li className={isActive("/contact") ? "active" : ""}>
          <a href="#contact">Contact</a>
        </li>
      </ul>

      {/* Auth buttons */}
      <div className="navbar-actions">
        {authToken ? (
          <Link to="/UserDashboard" className="btn-outline">
            Dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn-text">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
