import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Sermons from './pages/Sermons';
import SermonDetail from './pages/SermonDetail';
import Contact from './pages/Contact';
import Give from './pages/Give';
import YouthChildren from './pages/YouthChildren';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileUpdate from './pages/ProfileUpdate';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ui/ProtectedRoute';

function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{t('notFound.message')}</p>
      <a href="/" className="btn btn-primary">{t('notFound.goHome')}</a>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/*"
        element={(
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
              <Route path="youth-children" element={<YouthChildren />} />
              <Route
                path="profile-update"
                element={(
                  <ProtectedRoute>
                    <ProfileUpdate />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="admin"
                element={(
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        )}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
