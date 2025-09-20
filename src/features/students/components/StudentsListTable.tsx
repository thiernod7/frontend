import { Link } from 'react-router-dom';
import { useStudents } from '../api';
import { getPhotoUrl } from '../../../shared/utils/photos';
import { logger } from '../../../shared/utils/logger';
import type { TStudentSearchParams } from '../types';

export interface StudentsListTableProps {
  classeId?: string;
  showClasseColumn?: boolean;
  showActions?: boolean;
  layout?: 'table' | 'cards' | 'compact';
  isLoading?: boolean;
  error?: Error | null;
  searchParams?: TStudentSearchParams;
}

/**
 * Composant flexible pour afficher la liste des élèves
 * 
 * Features:
 * - Affichage en table ou en cards
 * - Filtre par classe optionnel
 * - Recherche intégrée
 * - Actions sur chaque élève
 * - Responsive design
 */
export function StudentsListTable({
  classeId,
  showClasseColumn = true,
  showActions = true,
  layout = 'table',
  isLoading: externalLoading,
  error: externalError,
  searchParams,
}: StudentsListTableProps) {
  
  // Construire les paramètres de recherche
  const queryParams: TStudentSearchParams = {
    ...searchParams,
    ...(classeId && { classe_id: classeId }),
  };

  // Récupération des données
  const { 
    data: students, 
    isLoading: internalLoading, 
    error: internalError 
  } = useStudents(queryParams);

  const isLoading = externalLoading ?? internalLoading;
  const error = externalError ?? internalError;

  logger.feature('StudentsList', 'Rendu composant', {
    classeId,
    showClasseColumn,
    layout,
    studentsCount: students?.length || 0,
    isLoading,
    hasError: !!error
  });

  // Gestion des erreurs
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-500">
          Impossible de charger la liste des élèves.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Pas d'élèves
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun élève</h3>
        <p className="mt-1 text-sm text-gray-500">
          {classeId ? 'Aucun élève inscrit dans cette classe.' : 'Aucun élève trouvé.'}
        </p>
        {showActions && (
          <div className="mt-6">
            <Link
              to="/students/create"
              state={{ classeId }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter un élève
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Affichage en table
  if (layout === 'table') {
    return (
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élève
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matricule
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de naissance
              </th>
              {showClasseColumn && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              {showActions && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {student.personne.photo ? (
                          <img 
                            src={getPhotoUrl(student.personne.photo) || ''} 
                            alt={`${student.personne.prenom} ${student.personne.nom}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `
                                  <span class="text-gray-500 font-medium text-sm">
                                    ${student.personne.prenom.charAt(0)}${student.personne.nom.charAt(0)}
                                  </span>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 font-medium text-sm">
                            {student.personne.prenom.charAt(0)}{student.personne.nom.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.personne.prenom} {student.personne.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.personne.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.numero_matricule}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(student.date_naissance).toLocaleDateString('fr-FR')}
                </td>
                {showClasseColumn && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.classe_actuelle ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.classe_actuelle.nom}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Non assigné</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.personne.telephone}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/students/${student.id}`}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      Voir détail
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Compteur en bas */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{students.length}</span> élève{students.length > 1 ? 's' : ''}
            {classeId && ' dans cette classe'}
          </div>
        </div>
      </div>
    );
  }

  // Affichage en cards (pour plus tard)
  return (
    <div className="text-center py-4 text-gray-500">
      Layout cards pas encore implémenté
    </div>
  );
}