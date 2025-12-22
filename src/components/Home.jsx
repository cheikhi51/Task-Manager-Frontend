import React from "react";
import { Link } from "react-router-dom";


function Home() {
  return (
    <section className="home" id="home">
      <div className="home-container">
        {/* Left content */}
        <div className="home-text">
          <h1>
            Organize your work <br />
            <span>Efficiently & Simply</span>
          </h1>

          <p>
            TaskManager helps you create projects, manage tasks, and stay
            productive — all in one clean and intuitive workspace.
          </p>

          <div className="home-actions">
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
            <a href="#contact" className="btn-secondary1">
              Contact Us
            </a>
          </div>
        </div>

        {/* Right visual */}
        <div className="home-visual">
          <img
            src="/task-management-illustration.png"
            alt="Task management illustration"
          />
        </div>
      </div>
    </section>
  );
}

export default Home;
