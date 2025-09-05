import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './app/providers';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import ClassesPage from './features/classes/ClassesPage';
import { DashboardLayout } from './shared/components/Layout';
import { isAuthenticated } from './features/auth/api';

// Pages placeholder pour les autres features
function FinancePage() {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
      <p className="text-gray-600">Feature en cours de développement...</p>
    </div>
  );
}

function DocumentsPage() {
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
      <p className="text-gray-600">Feature en cours de développement...</p>
    </div>
  );
}

// Composant pour protéger les routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/classes" element={<ClassesPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </Providers>
  );
}

export default App
