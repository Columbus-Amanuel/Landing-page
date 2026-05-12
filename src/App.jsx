import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import Layout from '@/components/layout/Layout';
import ScrollToTop from '@/components/common/ScrollToTop';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Sermons from '@/pages/Sermons';
import SermonDetail from '@/pages/SermonDetail';
import Contact from '@/pages/Contact';
import Give from '@/pages/Give';
import YouthChildren from '@/pages/YouthChildren';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ProfileUpdate from '@/pages/ProfileUpdate';
import NotFound from '@/pages/NotFound';
import AdminLayout from '@/pages/admin/AdminLayout';
import ConstructionBanner from '@/components/common/ConstructionBanner';

function AppRoutes() {
  return (
    <>
      <ConstructionBanner />
      <Routes>
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.register} element={<Register />} />

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
                path="admin/*"
                element={(
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        )}
      />
    </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <LanguageProvider>
          <SiteSettingsProvider>
            <TooltipProvider delayDuration={150}>
              <AppRoutes />
              <Toaster />
            </TooltipProvider>
          </SiteSettingsProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
