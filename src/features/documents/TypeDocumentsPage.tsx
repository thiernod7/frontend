import { useState } from 'react';
import { useTypeDocuments, useCreateTypeDocument, useDeleteTypeDocument } from './api';
import { logger } from '../../shared/utils/logger';
import type { TTypeDocument, TTypeDocumentCreate } from './types';

export function TypeDocumentsPage() {
  logger.feature('TypeDocumentsPage', 'Page types de documents chargée');
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<TTypeDocument | null>(null);
  
  const { data: typeDocuments, isLoading, isError } = useTypeDocuments();
  const createMutation = useCreateTypeDocument();
  const deleteMutation = useDeleteTypeDocument();

  const handleCreate = async (data: TTypeDocumentCreate) => {
    try {
      await createMutation.mutateAsync(data);
      setShowCreateForm(false);
      logger.feature('TypeDocumentsPage', 'Type de document créé avec succès');
    } catch (error) {
      logger.feature('TypeDocumentsPage', 'Erreur création type de document', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de document ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        logger.feature('TypeDocumentsPage', 'Type de document supprimé avec succès');
      } catch (error) {
        logger.feature('TypeDocumentsPage', 'Erreur suppression type de document', error);
      }
    }
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-500">
          Impossible de charger les types de documents.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📄 Types de Documents</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les types de documents requis pour les inscriptions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ➕ Nouveau type de document
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {typeDocuments && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total types
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeDocuments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🔴</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Obligatoires
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeDocuments.filter(doc => doc.est_obligatoire).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🟡</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Optionnels
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeDocuments.filter(doc => !doc.est_obligatoire).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des types de documents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Liste des types de documents
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : typeDocuments && typeDocuments.length > 0 ? (
            <div className="space-y-3">
              {typeDocuments.map((typeDoc) => (
                <div
                  key={typeDoc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {typeDoc.est_obligatoire ? '🔴' : '🟡'}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {typeDoc.nom}
                        </h4>
                        {typeDoc.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {typeDoc.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            typeDoc.est_obligatoire 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {typeDoc.est_obligatoire ? 'Obligatoire' : 'Optionnel'}
                          </span>
                          {typeDoc.format_accepte && (
                            <span className="text-xs text-gray-500">
                              Formats: {typeDoc.format_accepte}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDocument(typeDoc)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(typeDoc.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">📄</span>
              <p className="text-lg font-medium mb-2">Aucun type de document défini</p>
              <p className="text-sm">
                Commencez par créer des types de documents pour les inscriptions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création */}
      {showCreateForm && (
        <CreateTypeDocumentModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Modal d'édition */}
      {selectedDocument && (
        <EditTypeDocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

// Modal de création (version simple pour commencer)
function CreateTypeDocumentModal({ 
  onClose, 
  onSubmit, 
  isLoading 
}: {
  onClose: () => void;
  onSubmit: (data: TTypeDocumentCreate) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<TTypeDocumentCreate>({
    nom: '',
    description: '',
    est_obligatoire: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nom.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Nouveau type de document
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom du document *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Certificat de naissance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Description optionnelle du document"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="obligatoire"
                checked={formData.est_obligatoire}
                onChange={(e) => setFormData({ ...formData, est_obligatoire: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="obligatoire" className="ml-2 block text-sm text-gray-900">
                Document obligatoire
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.nom.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Création...' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal d'édition (placeholder pour l'instant)
function EditTypeDocumentModal({ 
  document, 
  onClose 
}: {
  document: TTypeDocument;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Modifier : {document.nom}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-500 mb-4">
            Modification en cours de développement...
          </p>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}