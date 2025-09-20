import React, { useState } from 'react';
import { Edit2, Trash2, Euro } from 'lucide-react';
import { useFrais, useDeleteFrais } from '../api';
import { useCycles, useNiveaux } from '../../classes/api';
import type { TAnneeScolaire } from '../../classes/types';
import { formatMontantGNF } from '../../../shared/utils/currency';
import { logger } from '../../../shared/utils/logger';

interface FraisListProps {
  searchTerm: string;
  onEdit: (id: string) => void;
  currentYear?: TAnneeScolaire;
}

const FraisList: React.FC<FraisListProps> = ({ searchTerm, onEdit, currentYear }) => {
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');

  // Data fetching
  const { data: cycles } = useCycles({ active_only: true });
  const { data: niveaux } = useNiveaux({ active_only: true });
  
  const deleteMutation = useDeleteFrais();

  // Fetch frais only if we have the required parameters
  const canFetchFrais = !!(currentYear?.id && selectedCycle && selectedNiveau);
  const { data: frais, isLoading } = useFrais(
    canFetchFrais ? {
      annee_scolaire_id: currentYear.id,
      cycle_id: selectedCycle,
      niveau_id: selectedNiveau,
    } : {
      annee_scolaire_id: '',
      cycle_id: '',
      niveau_id: ''
    },
    { enabled: canFetchFrais }
  );

  // Filter frais by search term
  const filteredFrais = frais?.filter(f =>
    f.type_frais?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string, typeNom: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le frais "${typeNom}" ?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        logger.feature('FraisList', 'Frais supprimé avec succès', { id, typeNom });
      } catch (error) {
        logger.error('FraisList: Erreur suppression frais', error);
      }
    }
  };

  const formatMontant = (montant: number) => {
    return formatMontantGNF(montant);
  };

  if (!currentYear) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Aucune année scolaire active trouvée.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filtres */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cycle *
          </label>
          <select
            value={selectedCycle}
            onChange={(e) => {
              setSelectedCycle(e.target.value);
              setSelectedNiveau(''); // Reset niveau when cycle changes
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Sélectionner un cycle</option>
            {cycles?.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau *
          </label>
          <select
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!selectedCycle}
            required
          >
            <option value="">Sélectionner un niveau</option>
            {niveaux
              ?.filter(niveau => niveau.cycle_id === selectedCycle)
              .map((niveau) => (
                <option key={niveau.id} value={niveau.id}>
                  {niveau.nom}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Message si pas de sélection */}
      {!canFetchFrais && (
        <div className="text-center py-8">
          <Euro className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Sélectionnez un cycle et un niveau pour voir les frais.</p>
        </div>
      )}

      {/* Loading */}
      {canFetchFrais && isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement des frais...</p>
        </div>
      )}

      {/* Liste des frais */}
      {canFetchFrais && !isLoading && (
        <>
          {filteredFrais.length === 0 ? (
            <div className="text-center py-8">
              <Euro className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun frais trouvé pour cette sélection.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de frais
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFrais.map((frais) => (
                    <tr key={frais.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Euro className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {frais.type_frais?.nom || 'Type non défini'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {frais.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatMontant(frais.montant)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEdit(frais.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Modifier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(frais.id, frais.type_frais?.nom || 'Type non défini')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Supprimer"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FraisList;