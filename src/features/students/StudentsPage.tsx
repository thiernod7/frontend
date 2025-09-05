import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentsList } from './components/StudentsList';
import { StudentDetail } from './components/StudentDetail';
import { StudentForm } from './components/StudentForm';
import type { TStudent, TStudentSearchParams } from './types';

export function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<TStudent | null>(null);
  const [searchParams, setSearchParams] = useState<TStudentSearchParams>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  // Gérer le paramètre URL create=true depuis le dashboard
  useEffect(() => {
    if (urlSearchParams.get('create') === 'true') {
      setShowCreateForm(true);
      // Nettoyer l'URL
      urlSearchParams.delete('create');
      setUrlSearchParams(urlSearchParams);
    }
  }, [urlSearchParams, setUrlSearchParams]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Élèves</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestion des élèves et des inscriptions de votre établissement
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ➕ Nouvel élève
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des élèves */}
        <div className={selectedStudent ? 'lg:col-span-1' : 'lg:col-span-3'}>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Liste des élèves
              </h3>
              
              <StudentsList
                searchParams={searchParams}
                onSearchChange={setSearchParams}
                selectedStudent={selectedStudent}
                onStudentSelect={setSelectedStudent}
              />
            </div>
          </div>
        </div>

        {/* Détail élève */}
        {selectedStudent && (
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détail élève
                  </h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <StudentDetail studentId={selectedStudent.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de création d'élève */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Nouvelle inscription d'élève
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <StudentForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  // Optionnel : rafraîchir la liste des élèves
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
