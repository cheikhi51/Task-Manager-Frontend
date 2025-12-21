function Services() {
  return (
    <section className="services" id="services">
      <div className="services-container">
        <div className="services-header">
          <h2>Our Services</h2>
          <p>
            Everything you need to manage projects and tasks efficiently in one
            powerful platform.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <h3>Project Management</h3>
            <p>
              Create and organize projects with a clear structure to keep your
              work on track from start to finish.
            </p>
          </div>

          <div className="service-card">
            <h3>Task Tracking</h3>
            <p>
              Break projects into tasks, set deadlines, and track progress in
              real time with ease.
            </p>
          </div>

          <div className="service-card">
            <h3>Collaboration</h3>
            <p>
              Work seamlessly with your team by sharing tasks, updates, and
              progress in one centralized workspace.
            </p>
          </div>

          <div className="service-card">
            <h3>Productivity Insights</h3>
            <p>
              Monitor performance and stay focused with clear visibility into
              completed and pending tasks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;