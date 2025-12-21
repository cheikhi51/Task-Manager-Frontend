function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>
            Have a question or suggestion? Don't hesitate to contact us,
            our team will respond quickly.
          </p>
        </div>

        {/* Content */}
        <div className="contact-content">
          {/* Info */}
          <div className="contact-info">
            <h3>Stay in touch</h3>
            <p>
              TaskManager is designed to help you organize your work and
              improve your productivity. We are always happy to exchange
              with you.
            </p>

            <ul>
              <li><strong>Email :</strong> support@taskmanager.com</li>
              <li><strong>Phone :</strong> +212 6 00 00 00 00</li>
              <li><strong>Address :</strong> Rabat, Morocco</li>
            </ul>
          </div>

          {/* Form */}
          <form className="contact-form">
            <input type="text" placeholder="Your name" required />
            <input type="email" placeholder="Your email" required />
            <textarea placeholder="Your message" rows="5" required></textarea>
            <button type="submit" className="btn-primary">
              Send the message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
