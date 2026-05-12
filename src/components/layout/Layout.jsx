import Navbar from './Navbar';
import Footer from './Footer';

/**
 * App shell: navbar, main content, footer. Used by every public route.
 * Auth pages (Login / Register) render OUTSIDE this Layout so they get the
 * full viewport.
 */
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
