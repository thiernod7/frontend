import { useStudents } from '../api';
import { getPhotoUrl } from '../../../shared/utils/photos';
import FilterPanel from './FilterPanel';
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
  const { data: students, isLoading, isError } = useStudents(searchParams);

  const handleResetFilters = () => {
    onSearchChange({});
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
      {/* Panel de filtres simplifiés */}
      <FilterPanel
        filters={searchParams}
        onFiltersChange={onSearchChange}
        onReset={handleResetFilters}
        isLoading={isLoading}
      />

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
              {Object.keys(searchParams).length > 0 ? (
                <div>
                  <p>Aucun élève trouvé</p>
                  <p className="text-sm mt-1">avec les filtres appliqués</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Effacer les filtres
                  </button>
                </div>
              ) : (
                'Aucun élève enregistré'
              )}
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
          {Object.keys(searchParams).length > 0 && (
            <span> avec les filtres appliqués</span>
          )}
        </div>
      )}
    </div>
  );
}
