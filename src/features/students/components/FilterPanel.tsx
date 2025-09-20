import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useClasses } from '../../classes/api';
import type { TStudentSearchParams } from '../types';

interface FilterPanelProps {
  filters: TStudentSearchParams;
  onFiltersChange: (filters: TStudentSearchParams) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function FilterPanel({ filters, onFiltersChange, onReset, isLoading }: FilterPanelProps) {
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses({ active_only: true });

  const updateFilter = (key: keyof TStudentSearchParams, value: TStudentSearchParams[typeof key]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilter = (filterKey: keyof TStudentSearchParams) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = () => {
    // Pour le moment, seul classe_id est fonctionnel côté backend
    return !!(filters.classe_id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
      {/* Recherche principale */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, téléphone..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        
        {hasActiveFilters() && (
          <button
            onClick={onReset}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtre par classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
          <div className="flex space-x-2">
            <select
              value={filters.classe_id || ''}
              onChange={(e) => updateFilter('classe_id', e.target.value || undefined)}
              disabled={isLoadingClasses || isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Toutes les classes</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom} - {classe.niveau?.nom || 'Niveau non défini'}
                </option>
              ))}
            </select>
            {filters.classe_id && (
              <button
                onClick={() => clearFilter('classe_id')}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Effacer le filtre classe"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtre par sexe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genre
            <span className="text-xs text-gray-500 ml-1">(Bientôt disponible)</span>
          </label>
          <div className="flex space-x-2">
            <select
              value={filters.sexe || ''}
              onChange={(e) => updateFilter('sexe', e.target.value as 'M' | 'F' || undefined)}
              disabled={true} // Temporairement désactivé
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent opacity-50 cursor-not-allowed"
            >
              <option value="">Tous les genres</option>
              <option value="M">👦 Masculin</option>
              <option value="F">👧 Féminin</option>
            </select>
            <div className="p-2 text-gray-300" title="Filtre non disponible">
              <XMarkIcon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Le filtre par genre sera disponible après la mise à jour du backend.
          </p>
        </div>
      </div>
    </div>
  );
}