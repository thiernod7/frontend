import React, { useState } from 'react';
import { Plus, Edit, Save, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useCreateNiveau, useUpdateNiveau } from '../api';
import type { TNiveau, TCycle, TCreateNiveau, TUpdateNiveau } from '../types';

interface NiveauManagerProps {
  niveaux: TNiveau[];
  cycles: TCycle[];
  isLoading: boolean;
  searchTerm: string;
}

const NiveauManager: React.FC<NiveauManagerProps> = ({ 
  niveaux, 
  cycles, 
  isLoading, 
  searchTerm 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    cycle_id: '',
    is_active: true,
  });

  const createMutation = useCreateNiveau();
  const updateMutation = useUpdateNiveau();

  // Filter niveaux by search term
  const filteredNiveaux = niveaux.filter(niveau =>
    niveau.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (niveau.description && niveau.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (niveau.cycle?.nom && niveau.cycle.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group by cycle for better organization
  const niveauxByActiveCycle = filteredNiveaux.reduce((acc, niveau) => {
    const cycleId = niveau.cycle_id;
    const cycleName = niveau.cycle?.nom || 'Cycle non défini';
    
    if (!acc[cycleId]) {
      acc[cycleId] = {
        cycleName,
        niveaux: [],
      };
    }
    acc[cycleId].niveaux.push(niveau);
    return acc;
  }, {} as Record<string, { cycleName: string; niveaux: TNiveau[] }>);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createData: TCreateNiveau = {
        nom: formData.nom,
        description: formData.description || undefined,
        cycle_id: formData.cycle_id,
        is_active: formData.is_active,
      };
      await createMutation.mutateAsync(createData);
      setShowCreateForm(false);
      setFormData({ nom: '', description: '', cycle_id: '', is_active: true });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updateData: TUpdateNiveau = {
        nom: formData.nom,
        description: formData.description || undefined,
        cycle_id: formData.cycle_id,
        is_active: formData.is_active,
      };
      await updateMutation.mutateAsync({ id, data: updateData });
      setEditingId(null);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const startEdit = (niveau: TNiveau) => {
    setEditingId(niveau.id);
    setFormData({
      nom: niveau.nom,
      description: niveau.description || '',
      cycle_id: niveau.cycle_id,
      is_active: niveau.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: '', description: '', cycle_id: '', is_active: true });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeCycles = cycles.filter(c => c.is_active);

  return (
    <div className="p-6">
      {/* Create Button */}
      <div className="mb-4">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            disabled={activeCycles.length === 0}
          >
            <Plus className="w-4 h-4" />
            Nouveau niveau
          </button>
        ) : (
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-medium text-purple-900 mb-3">Nouveau niveau</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Nom du niveau"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Description (optionnel)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={formData.cycle_id}
                onChange={(e) => setFormData(prev => ({ ...prev, cycle_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Sélectionner un cycle</option>
                {activeCycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.nom}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-niveau-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="create-niveau-active" className="text-sm text-gray-700">
                  Niveau actif
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                  disabled={createMutation.isPending}
                >
                  <Save className="w-3 h-3" />
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ nom: '', description: '', cycle_id: '', is_active: true });
                  }}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {activeCycles.length === 0 && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <BookOpen className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Aucun cycle actif</h3>
          <p className="text-yellow-700">
            Vous devez d'abord créer et activer un cycle avant de pouvoir ajouter des niveaux.
          </p>
        </div>
      )}

      {/* Niveaux List */}
      {Object.keys(niveauxByActiveCycle).length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aucun niveau trouvé' : 'Aucun niveau'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Essayez de modifier votre recherche'
              : activeCycles.length > 0 ? 'Commencez par créer un nouveau niveau' : null
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(niveauxByActiveCycle).map(([cycleId, { cycleName, niveaux: cycleNiveaux }]) => (
            <div key={cycleId}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                {cycleName}
                <span className="text-sm font-normal text-gray-500">
                  ({cycleNiveaux.length} niveau{cycleNiveaux.length > 1 ? 'x' : ''})
                </span>
              </h3>
              
              <div className="space-y-3 pl-6">
                {cycleNiveaux.map((niveau) => (
                  <div key={niveau.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    {editingId === niveau.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleUpdate(niveau.id); }} className="space-y-3">
                        <input
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description (optionnel)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                          value={formData.cycle_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, cycle_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Sélectionner un cycle</option>
                          {activeCycles.map((cycle) => (
                            <option key={cycle.id} value={cycle.id}>
                              {cycle.nom}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`edit-niveau-active-${niveau.id}`}
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor={`edit-niveau-active-${niveau.id}`} className="text-sm text-gray-700">
                            Niveau actif
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                            disabled={updateMutation.isPending}
                          >
                            <Save className="w-3 h-3" />
                            Sauvegarder
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{niveau.nom}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              niveau.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {niveau.is_active ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Actif
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Inactif
                                </>
                              )}
                            </span>
                          </div>
                          {niveau.description && (
                            <p className="text-sm text-gray-600">{niveau.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => startEdit(niveau)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NiveauManager;
