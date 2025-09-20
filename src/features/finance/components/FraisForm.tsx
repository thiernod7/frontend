import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useFraisById, useCreateFrais, useUpdateFrais, useTypesFrais } from '../api';
import { useCycles, useNiveaux, useCurrentYear } from '../../classes/api';
import type { TCreateFrais, TUpdateFrais } from '../types';
import { MONTANT_CONSTANTS } from '../../../shared/utils/currency';
import { logger } from '../../../shared/utils/logger';

interface FraisFormProps {
  fraisId?: string | null;
  onClose: () => void;
}

const FraisForm: React.FC<FraisFormProps> = ({ fraisId, onClose }) => {
  const [formData, setFormData] = useState({
    type_frais_id: '',
    montant: '',
    description: '',
    annee_scolaire_id: '',
    cycle_id: '',
    niveau_id: '',
    site_id: '',
  });

  const isEditing = Boolean(fraisId);
  const { data: frais, isLoading: fraisLoading } = useFraisById(fraisId || '');
  const { data: cycles } = useCycles({ active_only: true });
  const { data: niveaux } = useNiveaux({ active_only: true });
  const { data: currentYear } = useCurrentYear();
  const { data: typesFrais = [] } = useTypesFrais();
  const createMutation = useCreateFrais();
  const updateMutation = useUpdateFrais();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && frais) {
      setFormData({
        type_frais_id: frais.type_frais_id,
        montant: frais.montant.toString(),
        description: frais.description || '',
        annee_scolaire_id: frais.annee_scolaire_id,
        cycle_id: frais.cycle_id || '',
        niveau_id: frais.niveau_id || '',
        site_id: frais.site_id || '',
      });
    } else if (!isEditing && currentYear) {
      // Auto-sélectionner l'année courante pour nouveau
      setFormData(prev => ({
        ...prev,
        annee_scolaire_id: currentYear.id,
      }));
    }
  }, [frais, isEditing, currentYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('FraisForm: Début soumission formulaire', { isEditing, fraisId, formData });

    try {
      if (isEditing && fraisId) {
        const updateData: TUpdateFrais = {
          type_frais_id: formData.type_frais_id,
          montant: parseFloat(formData.montant),
          description: formData.description || undefined,
          annee_scolaire_id: formData.annee_scolaire_id,
          cycle_id: formData.cycle_id || undefined,
          niveau_id: formData.niveau_id || undefined,
          site_id: formData.site_id || undefined,
        };
        logger.info('FraisForm: Données pour mise à jour', updateData);
        await updateMutation.mutateAsync({ id: fraisId, data: updateData });
        logger.info('FraisForm: Frais mis à jour avec succès');
      } else {
        const createData: TCreateFrais = {
          type_frais_id: formData.type_frais_id,
          montant: parseFloat(formData.montant),
          description: formData.description || undefined,
          annee_scolaire_id: formData.annee_scolaire_id,
          cycle_id: formData.cycle_id || undefined,
          niveau_id: formData.niveau_id || undefined,
          site_id: formData.site_id || undefined,
        };
        logger.info('FraisForm: Données pour création', createData);
        await createMutation.mutateAsync(createData);
        logger.info('FraisForm: Frais créé avec succès');
      }
      onClose();
    } catch (error) {
      logger.error('FraisForm: Erreur lors de la sauvegarde', error);
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && fraisLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Modifier le frais' : 'Nouveau frais'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de frais */}
          <div>
            <label htmlFor="type_frais_id" className="block text-sm font-medium text-gray-700 mb-2">
              Type de frais <span className="text-red-500">*</span>
            </label>
            <select
              id="type_frais_id"
              value={formData.type_frais_id}
              onChange={(e) => handleInputChange('type_frais_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner un type</option>
              {typesFrais.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nom}
                </option>
              ))}
            </select>
          </div>          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant ({MONTANT_CONSTANTS.CURRENCY_CODE}) *
            </label>
            <input
              type="number"
              value={formData.montant}
              onChange={(e) => handleInputChange('montant', e.target.value)}
              placeholder="Ex: 500000"
              required
              min={MONTANT_CONSTANTS.MONTANT_MIN}
              max={MONTANT_CONSTANTS.MONTANT_MAX}
              step={MONTANT_CONSTANTS.STEP_DEFAULT}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Montant en {MONTANT_CONSTANTS.CURRENCY_LABEL} (min: {MONTANT_CONSTANTS.MONTANT_MIN.toLocaleString()} {MONTANT_CONSTANTS.CURRENCY_CODE})
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du frais (optionnel)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle
            </label>
            <select
              value={formData.cycle_id}
              onChange={(e) => {
                handleInputChange('cycle_id', e.target.value);
                handleInputChange('niveau_id', ''); // Reset niveau
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              <option value="">Tous les cycles</option>
              {cycles?.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.nom}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Laisser vide pour appliquer à tous les cycles
            </p>
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau
            </label>
            <select
              value={formData.niveau_id}
              onChange={(e) => handleInputChange('niveau_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting || !formData.cycle_id}
            >
              <option value="">Tous les niveaux</option>
              {niveaux
                ?.filter(niveau => !formData.cycle_id || niveau.cycle_id === formData.cycle_id)
                .map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.nom}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Laisser vide pour appliquer à tous les niveaux du cycle
            </p>
          </div>

          {/* Error display */}
          {(createMutation.error || updateMutation.error) && (
            <div className="text-red-600 text-sm">
              Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2"
              disabled={isSubmitting || !formData.type_frais_id.trim() || !formData.montant.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FraisForm;