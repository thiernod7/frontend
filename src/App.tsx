import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './app/providers';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TypeDocumentsPage } from './pages/TypeDocumentsPage';
import ClassesPage from './features/classes/ClassesPage';
import FinancePage from './features/finance/FinancePage';
import { DashboardLayout } from './shared/components/Layout';
import { isAuthenticated } from './features/auth/api';

// Pages placeholder pour les autres features
function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📄 Gestion des Documents</h1>
        <p className="text-gray-600 mb-8">
          Gérez les types de documents et suivez leur statut pour chaque élève
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card Types de Documents */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📋</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Configuration
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Types de Documents
                    </dd>
                    <dd className="text-sm text-gray-500 mt-1">
                      Créer et gérer les types de documents requis pour les inscriptions
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-5">
                <a
                  href="/documents/types"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Gérer les types
                </a>
              </div>
            </div>
          </div>

          {/* Card Suivi Documents */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Suivi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      État des Documents
                    </dd>
                    <dd className="text-sm text-gray-500 mt-1">
                      Suivre les documents fournis et manquants par élève
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-5">
                <a
                  href="/students"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Voir les élèves
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>💡 Astuce: Configurez d'abord les types de documents avant de procéder aux inscriptions</p>
        </div>
      </div>
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
                    <Route path="/documents/types" element={<TypeDocumentsPage />} />
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
