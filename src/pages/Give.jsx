export default function Give() {
  const givingOptions = [
    { amount: 25, label: '$25' },
    { amount: 50, label: '$50' },
    { amount: 100, label: '$100' },
    { amount: 250, label: '$250' },
    { amount: 500, label: '$500' },
  ];

  const funds = [
    { id: 'general', label: 'General Fund', desc: 'Supports all church ministries and operations' },
    { id: 'missions', label: 'Missions Fund', desc: 'Supports global and local mission partners' },
    { id: 'building', label: 'Building Fund', desc: 'Contributes to facility growth and maintenance' },
    { id: 'benevolence', label: 'Benevolence Fund', desc: 'Helps families and individuals in need' },
  ];

  return (
    <div className="page-give">
      <section className="page-hero">
        <h1>Give</h1>
        <p>Your generosity fuels the mission. Thank you for partnering with us.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="give-grid">
            {/* Online Giving */}
            <div className="give-form-wrapper">
              <h2>Give Online</h2>
              <p className="give-subtitle">
                Giving is secure, easy, and available anytime. You can give a one-time gift or set
                up recurring giving.
              </p>

              <div className="give-form">
                <div className="form-group">
                  <label>Select Fund</label>
                  <select className="form-input">
                    {funds.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="frequency" value="one-time" defaultChecked /> One-Time
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="frequency" value="weekly" /> Weekly
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="frequency" value="monthly" /> Monthly
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <div className="amount-grid">
                    {givingOptions.map((opt) => (
                      <button key={opt.amount} className="amount-btn">{opt.label}</button>
                    ))}
                  </div>
                  <input
                    type="number"
                    className="form-input mt-2"
                    placeholder="Or enter custom amount"
                    min="1"
                    step="1"
                  />
                </div>

                <div className="give-notice">
                  <p>
                    🔒 Payments are processed securely. You'll receive a tax receipt via email.
                    To set up online giving, integrate your preferred payment processor
                    (e.g., Stripe, Tithe.ly, or Pushpay).
                  </p>
                </div>

                <button className="btn btn-primary btn-full btn-lg">
                  Give Now
                </button>
              </div>
            </div>

            {/* Other Ways to Give */}
            <div className="give-info">
              <h2>Other Ways to Give</h2>

              <div className="give-method">
                <h3>📮 By Mail</h3>
                <p>Make checks payable to <strong>Grace Community Church</strong> and mail to:</p>
                <p>123 Faith Avenue<br />Your City, ST 12345</p>
              </div>

              <div className="give-method">
                <h3>📱 Text to Give</h3>
                <p>Text <strong>GIVE</strong> to <strong>(555) 555-5555</strong> to give from your mobile device.</p>
              </div>

              <div className="give-method">
                <h3>💼 Planned Giving</h3>
                <p>
                  Consider leaving a legacy gift in your estate planning. Contact our office to
                  learn more about how your long-term giving can impact generations to come.
                </p>
              </div>

              <div className="give-method">
                <h3>📊 Where Your Giving Goes</h3>
                <ul className="give-breakdown">
                  {funds.map((f) => (
                    <li key={f.id}>
                      <strong>{f.label}</strong> — {f.desc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="give-scripture">
                <blockquote>
                  "Each of you should give what you have decided in your heart to give, not
                  reluctantly or under compulsion, for God loves a cheerful giver."
                  <cite>— 2 Corinthians 9:7</cite>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
