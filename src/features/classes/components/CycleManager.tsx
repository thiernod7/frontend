import React, { useState } from 'react';
import { Plus, Edit, Save, Users, CheckCircle, XCircle } from 'lucide-react';
import { useCreateCycle, useUpdateCycle } from '../api';
import type { TCycle, TCreateCycle, TUpdateCycle } from '../types';

interface CycleManagerProps {
  cycles: TCycle[];
  isLoading: boolean;
  searchTerm: string;
}

const CycleManager: React.FC<CycleManagerProps> = ({ cycles, isLoading, searchTerm }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    is_active: true,
  });

  const createMutation = useCreateCycle();
  const updateMutation = useUpdateCycle();

  // Filter cycles by search term
  const filteredCycles = cycles.filter(cycle =>
    cycle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cycle.description && cycle.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createData: TCreateCycle = {
        nom: formData.nom,
        description: formData.description || undefined,
        is_active: formData.is_active,
      };
      await createMutation.mutateAsync(createData);
      setShowCreateForm(false);
      setFormData({ nom: '', description: '', is_active: true });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const cycle = cycles.find(c => c.id === id);
      if (!cycle) return;

      const updateData: TUpdateCycle = {
        nom: formData.nom,
        description: formData.description || undefined,
        is_active: formData.is_active,
      };
      await updateMutation.mutateAsync({ id, data: updateData });
      setEditingId(null);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const startEdit = (cycle: TCycle) => {
    setEditingId(cycle.id);
    setFormData({
      nom: cycle.nom,
      description: cycle.description || '',
      is_active: cycle.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: '', description: '', is_active: true });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Create Button */}
      <div className="mb-4">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau cycle
          </button>
        ) : (
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-medium text-green-900 mb-3">Nouveau cycle</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Nom du cycle"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                placeholder="Description (optionnel)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="create-active" className="text-sm text-gray-700">
                  Cycle actif
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                  disabled={createMutation.isPending}
                >
                  <Save className="w-3 h-3" />
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ nom: '', description: '', is_active: true });
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

      {/* Cycles List */}
      {filteredCycles.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aucun cycle trouvé' : 'Aucun cycle'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par créer un nouveau cycle'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCycles.map((cycle) => (
            <div key={cycle.id} className="border rounded-lg p-4 hover:bg-gray-50">
              {editingId === cycle.id ? (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(cycle.id); }} className="space-y-3">
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optionnel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`edit-active-${cycle.id}`}
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`edit-active-${cycle.id}`} className="text-sm text-gray-700">
                      Cycle actif
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
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
                      <h3 className="font-medium text-gray-900">{cycle.nom}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        cycle.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cycle.is_active ? (
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
                    {cycle.description && (
                      <p className="text-sm text-gray-600">{cycle.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => startEdit(cycle)}
                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CycleManager;
