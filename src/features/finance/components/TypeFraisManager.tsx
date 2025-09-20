import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { useTypesFrais, useCreateTypeFrais, useUpdateTypeFrais, useDeleteTypeFrais } from '../api';
import { logger } from '../../../shared/utils/logger';
import type { TTypeDeFrais, TCreateTypeDeFrais, TUpdateTypeDeFrais } from '../types';

interface TypeFraisFormProps {
  typeFrais?: TTypeDeFrais;
  onClose: () => void;
  onSuccess: () => void;
}

function TypeFraisForm({ typeFrais, onClose, onSuccess }: TypeFraisFormProps) {
  const [formData, setFormData] = useState<TCreateTypeDeFrais>({
    nom: typeFrais?.nom || '',
    description: typeFrais?.description || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const createMutation = useCreateTypeFrais();
  const updateMutation = useUpdateTypeFrais();

  const isEditing = !!typeFrais;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: typeFrais.id,
          data: formData as TUpdateTypeDeFrais
        });
        logger.feature('TypeFraisManager', 'Type de frais mis à jour', { id: typeFrais.id });
      } else {
        await createMutation.mutateAsync(formData);
        logger.feature('TypeFraisManager', 'Type de frais créé');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      logger.feature('TypeFraisManager', 'Erreur sauvegarde type frais', error);
      
      // Gestion des erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('unique') || error.message.includes('already exists')) {
          setErrors({ nom: 'Ce nom de type de frais existe déjà' });
        } else {
          setErrors({ general: 'Une erreur est survenue lors de la sauvegarde' });
        }
      }
    }
  };

  const handleChange = (field: keyof TCreateTypeDeFrais, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Modifier le type de frais' : 'Nouveau type de frais'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du type de frais *
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ex: Inscription, Scolarité, Cantine..."
              disabled={isLoading}
            />
            {errors.nom && (
              <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnelle)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description détaillée du type de frais..."
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : isEditing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmationProps {
  typeFrais: TTypeDeFrais;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function DeleteConfirmation({ typeFrais, onClose, onConfirm, isLoading }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-32 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Supprimer le type de frais
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            Êtes-vous sûr de vouloir supprimer "<strong>{typeFrais.nom}</strong>" ?
            Cette action est irréversible.
          </p>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TypeFraisManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTypeFrais, setEditingTypeFrais] = useState<TTypeDeFrais | undefined>();
  const [deletingTypeFrais, setDeletingTypeFrais] = useState<TTypeDeFrais | undefined>();

  const { data: typesFrais, isLoading, error } = useTypesFrais();
  const deleteMutation = useDeleteTypeFrais();

  logger.feature('TypeFraisManager', 'Composant chargé');

  const filteredTypesFrais = typesFrais?.filter(type =>
    type.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreate = () => {
    setEditingTypeFrais(undefined);
    setShowForm(true);
  };

  const handleEdit = (typeFrais: TTypeDeFrais) => {
    setEditingTypeFrais(typeFrais);
    setShowForm(true);
  };

  const handleDelete = (typeFrais: TTypeDeFrais) => {
    setDeletingTypeFrais(typeFrais);
  };

  const confirmDelete = async () => {
    if (!deletingTypeFrais) return;

    try {
      await deleteMutation.mutateAsync(deletingTypeFrais.id);
      logger.feature('TypeFraisManager', 'Type de frais supprimé', { id: deletingTypeFrais.id });
      setDeletingTypeFrais(undefined);
    } catch (error) {
      logger.feature('TypeFraisManager', 'Erreur suppression type frais', error);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erreur de chargement
            </h3>
            <p className="mt-2 text-sm text-red-700">
              Impossible de charger les types de frais.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Types de frais</h2>
          <p className="text-sm text-gray-600">
            Gérez les différents types de frais de votre établissement
          </p>
        </div>
        
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau type
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Rechercher un type de frais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {filteredTypesFrais.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Aucun type de frais trouvé' : 'Aucun type de frais configuré'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTypesFrais.map((typeFrais) => (
                    <tr key={typeFrais.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {typeFrais.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {typeFrais.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(typeFrais.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(typeFrais)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(typeFrais)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TypeFraisForm
          typeFrais={editingTypeFrais}
          onClose={() => {
            setShowForm(false);
            setEditingTypeFrais(undefined);
          }}
          onSuccess={() => {
            // Le composant se ferme automatiquement via onClose
          }}
        />
      )}

      {deletingTypeFrais && (
        <DeleteConfirmation
          typeFrais={deletingTypeFrais}
          onClose={() => setDeletingTypeFrais(undefined)}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}