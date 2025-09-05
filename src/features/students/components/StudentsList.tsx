import { useState } from 'react';
import { useStudents } from '../api';
import { getPhotoUrl } from '../../../shared/utils/photos';
import type { TStudent, TStudentSearchParams } from '../types';

interface StudentsListProps {
  searchParams: TStudentSearchParams;
  onSearchChange: (params: TStudentSearchParams) => void;
  selectedStudent: TStudent | null;
  onStudentSelect: (student: TStudent) => void;
}

export function StudentsList({
  searchParams,
  onSearchChange,
  selectedStudent,
  onStudentSelect,
}: StudentsListProps) {
  const [localSearch, setLocalSearch] = useState(searchParams.search || '');
  
  const { data: students, isLoading, isError } = useStudents(searchParams);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange({ ...searchParams, search: localSearch });
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    onSearchChange({ ...searchParams, search: undefined });
  };

  if (isError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-600">❌ Erreur de chargement des élèves</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-indigo-600 hover:text-indigo-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          🔍
        </button>
        {searchParams.search && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}

      {/* Liste des élèves */}
      {students && (
        <div className="space-y-2">
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchParams.search ? 
                `Aucun élève trouvé pour "${searchParams.search}"` : 
                'Aucun élève enregistré'
              }
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                onClick={() => onStudentSelect(student)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedStudent?.id === student.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-5">
                      {/* Photo ou avatar - agrandie */}
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-gray-100">
                        {student.personne.photo ? (
                          <img 
                            src={getPhotoUrl(student.personne.photo) || ''} 
                            alt={`${student.personne.prenom} ${student.personne.nom}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // En cas d'erreur, afficher les initiales
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `
                                  <span class="text-gray-500 font-semibold text-xl">
                                    ${student.personne.prenom.charAt(0)}${student.personne.nom.charAt(0)}
                                  </span>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 font-semibold text-xl">
                            {student.personne.prenom.charAt(0)}{student.personne.nom.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-lg truncate">
                          {student.personne.prenom} {student.personne.nom}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Matricule: {student.numero_matricule}
                        </p>
                        {student.classe_actuelle && (
                          <p className="text-sm text-indigo-600 font-medium truncate">
                            📚 {student.classe_actuelle.nom}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col justify-center space-y-1">
                    <div className="text-sm text-gray-600 font-medium">
                      {new Date(student.date_naissance).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {student.personne.sexe === 'M' ? '👨' : '👩'}
                    </div>
                    <div className="text-xs text-gray-400">
                      📞
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Compteur */}
      {students && students.length > 0 && (
        <div className="text-sm text-gray-500 text-center pt-2 border-t">
          {students.length} élève{students.length > 1 ? 's' : ''}
          {searchParams.search && ` trouvé${students.length > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
