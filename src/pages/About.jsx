export default function About() {
  const staff = [
    { name: 'Pastor John Smith', role: 'Lead Pastor', bio: 'John has served our community for over 15 years with a passion for biblical teaching and community outreach.' },
    { name: 'Pastor Sarah Johnson', role: 'Worship Pastor', bio: 'Sarah leads our worship ministry with a heart to help people encounter God through music.' },
    { name: 'Michael Davis', role: 'Youth Pastor', bio: 'Michael pours his energy into the next generation, building a foundation of faith for young people.' },
    { name: 'Emily Chen', role: 'Children\'s Ministry Director', bio: 'Emily creates engaging, safe, and fun environments for kids of all ages to learn about Jesus.' },
  ];

  const beliefs = [
    { title: 'The Bible', desc: 'We believe the Bible is the inspired, infallible Word of God and the supreme authority for faith and life.' },
    { title: 'The Trinity', desc: 'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit.' },
    { title: 'Salvation', desc: 'We believe salvation is by grace through faith in Jesus Christ alone, not by works.' },
    { title: 'The Church', desc: 'We believe the Church is the body of Christ, called to make disciples of all nations.' },
    { title: 'Baptism', desc: 'We practice believer\'s baptism as a public declaration of faith and commitment to Christ.' },
    { title: 'The Holy Spirit', desc: 'We believe in the ongoing work of the Holy Spirit empowering believers to live godly lives.' },
  ];

  return (
    <div className="page-about">
      {/* Hero */}
      <section className="page-hero">
        <h1>About Us</h1>
        <p>Rooted in faith. Growing in community. Serving the world.</p>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container container-narrow">
          <h2 className="section-title">Our Story</h2>
          <p>
            Grace Community Church was founded in 1985 by a small group of believers with a
            vision to plant a church that would be a beacon of hope in our city. What started
            as a handful of families meeting in a living room has grown into a thriving community
            of hundreds of people from all walks of life.
          </p>
          <p>
            Over the decades, we've seen God move in incredible ways — lives transformed,
            families restored, and our community impacted for good. We remain committed to our
            original vision: to know Christ and make Him known.
          </p>
          <p>
            We are affiliated with the National Association of Evangelicals and partner with
            missions organizations across five continents.
          </p>
        </div>
      </section>

      {/* Beliefs */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">What We Believe</h2>
          <div className="beliefs-grid">
            {beliefs.map((b) => (
              <div key={b.title} className="belief-card">
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="staff-grid">
            {staff.map((s) => (
              <div key={s.name} className="staff-card">
                <div className="staff-avatar">{s.name.charAt(0)}</div>
                <h3 className="staff-name">{s.name}</h3>
                <p className="staff-role">{s.role}</p>
                <p className="staff-bio">{s.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Find Us</h2>
          <div className="location-grid">
            <div className="location-info">
              <h3>Address</h3>
              <p>123 Faith Avenue</p>
              <p>Your City, ST 12345</p>
              <br />
              <h3>Phone</h3>
              <a href="tel:+15551234567">(555) 123-4567</a>
              <br /><br />
              <h3>Email</h3>
              <a href="mailto:info@gracecommunitychurch.org">info@gracecommunitychurch.org</a>
              <br /><br />
              <h3>Service Times</h3>
              <p>Sunday: 9:00 AM &amp; 11:00 AM</p>
              <p>Wednesday: 7:00 PM</p>
            </div>
            <div className="location-map">
              <div className="map-placeholder">
                <p>🗺️ Map Embed Here</p>
                <p className="text-sm">Replace with Google Maps iframe</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
