import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useClasse, useCreateClasse, useUpdateClasse, useNiveaux, useCurrentYear, useAllYears } from '../api';
import type { TCreateClasse, TUpdateClasse } from '../types';
import { logger } from '../../../shared/utils/logger';

interface ClasseFormProps {
  classeId?: string | null;
  onClose: () => void;
}

const ClasseForm: React.FC<ClasseFormProps> = ({ classeId, onClose }) => {
  const [formData, setFormData] = useState({
    nom: '',
    niveau_id: '',
    annee_scolaire_id: '',
    option_id: '',
    site_id: '',
    salle_id: '',
    professeur_principal_id: '',
    effectif_max: '',
  });

  const isEditing = Boolean(classeId);
  const { data: classe, isLoading: classeLoading } = useClasse(classeId || '');
  const { data: niveaux } = useNiveaux({ active_only: true });
  const { data: currentYear } = useCurrentYear();
  const { data: allYears } = useAllYears();
  const createMutation = useCreateClasse();
  const updateMutation = useUpdateClasse();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && classe) {
      setFormData({
        nom: classe.nom,
        niveau_id: classe.niveau?.id || '',
        annee_scolaire_id: classe.annee_scolaire_id || '',
        option_id: classe.option_id || '',
        site_id: classe.site_id || '',
        salle_id: classe.salle_id || '',
        professeur_principal_id: classe.professeur_principal_id || '',
        effectif_max: classe.effectif_max?.toString() || '',
      });
    } else if (!isEditing && currentYear) {
      // Auto-sélectionner l'année courante pour nouveau
      setFormData(prev => ({
        ...prev,
        annee_scolaire_id: currentYear.id,
      }));
    }
  }, [classe, isEditing, currentYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('ClasseForm: Début soumission formulaire', { isEditing, classeId, formData });

    try {
      if (isEditing && classeId) {
        const updateData: TUpdateClasse = {
          nom: formData.nom,
          niveau_id: formData.niveau_id || undefined,
        };
        logger.info('ClasseForm: Données pour mise à jour', updateData);
        await updateMutation.mutateAsync({ id: classeId, data: updateData });
        logger.info('ClasseForm: Classe mise à jour avec succès');
      } else {
        const createData: TCreateClasse = {
          nom: formData.nom,
          niveau_id: formData.niveau_id,
          annee_scolaire_id: formData.annee_scolaire_id,
          ...(formData.option_id && { option_id: formData.option_id }),
          ...(formData.site_id && { site_id: formData.site_id }),
          ...(formData.salle_id && { salle_id: formData.salle_id }),
          ...(formData.professeur_principal_id && { professeur_principal_id: formData.professeur_principal_id }),
          ...(formData.effectif_max && { effectif_max: parseInt(formData.effectif_max) }),
        };
        logger.info('ClasseForm: Données pour création', createData);
        await createMutation.mutateAsync(createData);
        logger.info('ClasseForm: Classe créée avec succès');
      }
      onClose();
    } catch (error) {
      logger.error('ClasseForm: Erreur lors de la sauvegarde', error);
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && classeLoading) {
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Modifier la classe' : 'Nouvelle classe'}
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
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la classe *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              placeholder="Ex: 6ème A"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau *
            </label>
            <select
              value={formData.niveau_id}
              onChange={(e) => handleInputChange('niveau_id', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Sélectionner un niveau</option>
              {niveaux?.map((niveau) => (
                <option key={niveau.id} value={niveau.id}>
                  {niveau.nom} 
                  {niveau.cycle?.nom && ` (${niveau.cycle.nom})`}
                </option>
              ))}
            </select>
          </div>

          {/* Année scolaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année scolaire *
            </label>
            <select
              value={formData.annee_scolaire_id}
              onChange={(e) => handleInputChange('annee_scolaire_id', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Sélectionner une année scolaire</option>
              {allYears?.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.nom}
                  {year.is_current && ' (Actuelle)'}
                </option>
              ))}
            </select>
          </div>

          {/* Effectif maximum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effectif maximum
            </label>
            <input
              type="number"
              value={formData.effectif_max}
              onChange={(e) => handleInputChange('effectif_max', e.target.value)}
              placeholder="Ex: 30"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
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
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
              disabled={isSubmitting || !formData.nom.trim() || !formData.niveau_id.trim() || !formData.annee_scolaire_id.trim()}
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

export default ClasseForm;
