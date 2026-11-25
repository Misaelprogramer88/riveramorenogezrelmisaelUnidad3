import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import QuotesPage from './pages/QuotesPage';

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas privadas protegidas con PrivateRoute */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <PrivateRoute>
                  <Layout>
                    <InventoryPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cotizaciones"
              element={
                <PrivateRoute>
                  <Layout>
                    <QuotesPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}
