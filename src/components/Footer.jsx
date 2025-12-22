import { MdEmail } from "react-icons/md";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import logoImage from "/task-manager-logo.png";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        {/* Logo */}
        <div className="footer-brand">
        <a href="#home" className="footer-logo">
            <img src={logoImage} style={{ height: "40px", width: "40px" }} alt="Task Manager Logo" />
            <span className="logo-primary">Task</span>
            <span className="logo-secondary">Manager</span>
        </a>
          <p>
            TaskManager helps you organize your projects and tasks in a simple,
            efficient and modern way.
          </p>
        </div>

        {/* Quick links */}
        <div className="footer-links">
          <h4>Quick links</h4>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Contact info */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email : support@taskmanager.com</p>
          <p>Phone : +212 5 22 50 43 23</p>
          <p>Address : Rabat, Morocco</p>
        </div>

        {/* Social media */}
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <MdEmail />
            <FaFacebook />
            <FaWhatsapp />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} TaskManager — All rights reserved
      </div>
    </footer>
  );
}

export default Footer;
