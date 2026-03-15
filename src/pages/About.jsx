import { Link } from 'react-router-dom';

export default function About() {
  const beliefs = [
    {
      title: 'The Holy Scriptures',
      desc: 'We believe the Old and New Testaments are divinely inspired and the final authority for faith, life, and worship.',
    },
    {
      title: 'The Trinity',
      desc: 'We believe in one God eternally existing as Father, Son, and Holy Spirit.',
    },
    {
      title: 'Jesus Christ',
      desc: 'Jesus is fully God and fully man. He died for our sins, rose on the third day, and will return in glory.',
    },
    {
      title: 'Salvation',
      desc: 'Salvation is by God’s grace through faith in Jesus Christ alone.',
    },
    {
      title: 'The Holy Spirit',
      desc: 'The Holy Spirit glorifies Christ and empowers believers for holy living and ministry.',
    },
    {
      title: 'The Church',
      desc: 'The Church is the body of Christ, called to fellowship, discipleship, and proclamation of the Gospel.',
    },
  ];

  return (
    <div className="page-about">
      <section className="page-hero">
        <h1>About EEUCC</h1>
        <p>Ethiopian Emmanuel United Church of Columbus</p>
      </section>

      <section className="section">
        <div className="container container-narrow">
          <h2 className="section-title">Our Story</h2>
          <p>
            Ethiopian Emmanuel United Church of Columbus (EEUCC) serves the Ethiopian Christian
            community in Central Ohio as a Christ-centered church for worship, fellowship, and
            spiritual growth.
          </p>
          <p>
            Public church milestones point to a founding period around 2012, and the congregation
            celebrated 13 years of ministry in 2025. The church is connected to the wider Ethiopian
            Emmanuel United Church tradition and continues to build a strong bilingual and
            multicultural ministry in Columbus.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">What We Believe</h2>
          <div className="beliefs-grid">
            {beliefs.map((belief) => (
              <div key={belief.title} className="belief-card">
                <h3>{belief.title}</h3>
                <p>{belief.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Worship & Contact</h2>
          <div className="location-grid">
            <div className="location-info">
              <h3>Church Name</h3>
              <p>Ethiopian Emmanuel United Church of Columbus (EEUCC)</p>
              <p>የኢትዮዽያ አማኑኤል ሕብረት ቤተክርስቲያን በኮለንበስ ኦሃዮ</p>
              <br />
              <h3>Address</h3>
              <p>1055 McNaughten Rd, Columbus, OH 43213</p>
              <br />
              <h3>Main Worship Service</h3>
              <p>Sunday: 4:00 PM – 7:00 PM</p>
              <br />
              <h3>Phone</h3>
              <a href="tel:+16148435975">(614) 843-5975</a>
              <br />
              <h3>Email</h3>
              <a href="mailto:emmanuel.ohio1055@gmail.com">emmanuel.ohio1055@gmail.com</a>
              <br />
              <h3>Online</h3>
              <a href="https://facebook.com/p/Ethiopian-Emmanuel-United-Church-of-Columbus-100067210424028/" target="_blank" rel="noreferrer">Facebook Page</a>
              <br />
              <a href="https://youtube.com/@ethiopianemmanuelunitedchu9591" target="_blank" rel="noreferrer">YouTube Channel</a>
            </div>
            <div className="location-map">
              <div className="map-placeholder">
                <p>Missing details?</p>
                <p className="text-sm">Logged-in members can help complete leadership, ministry, and legal details.</p>
                <Link to="/profile-update" className="btn btn-primary mt-4">Complete Church Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
