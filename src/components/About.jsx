
function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <div className="about-header">
          <h2>About TaskManager</h2>
          <p>
            A modern task management platform built to help individuals and
            teams work smarter, stay organized, and achieve more.
          </p>
        </div>

        <div className="about-content">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>
              TaskManager is designed to simplify how work is planned and
              executed. We focus on clarity, productivity, and collaboration so
              you can concentrate on what truly matters.
            </p>
          </div>

          <div className="about-card">
            <h3>What We Offer</h3>
            <p>
              Create projects, break them into actionable tasks, assign
              priorities, and track progress in real time using a clean and
              intuitive interface.
            </p>
          </div>

          <div className="about-card">
            <h3>Who It’s For</h3>
            <p>
              Whether you’re a freelancer, a startup team, or a growing
              organization, TaskManager adapts to your workflow and scales with
              your needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
