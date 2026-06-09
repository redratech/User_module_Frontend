import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="home-page">
      <div className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">User Module</span>
          <h1>Modern user management made simple</h1>
          <p>
            Manage users, upload documents, and review profiles from a single
            polished dashboard.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="button primary" to="/users">
            View Users
          </Link>
          <Link className="button secondary" to="/add-user">
            Add User
          </Link>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h3>Fast onboarding</h3>
          <p>Add new users quickly with easy form entry and document upload.</p>
        </article>
        <article className="feature-card">
          <h3>Document support</h3>
          <p>Upload and display user documents in Supabase storage.</p>
        </article>
        <article className="feature-card">
          <h3>Clean layout</h3>
          <p>Responsive UI with polished navigation and modern visuals.</p>
        </article>
      </div>
    </section>
  );
}

export default Home;
