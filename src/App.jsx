import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Sermons from './pages/Sermons';
import SermonDetail from './pages/SermonDetail';
import Contact from './pages/Contact';
import Give from './pages/Give';
import Login from './pages/Login';
import Register from './pages/Register';

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth pages — no layout nav/footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main site with Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="events" element={<Events />} />
                  <Route path="events/:id" element={<EventDetail />} />
                  <Route path="sermons" element={<Sermons />} />
                  <Route path="sermons/:id" element={<SermonDetail />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="give" element={<Give />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
