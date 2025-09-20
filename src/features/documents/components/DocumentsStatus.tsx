import { useDocumentsStatus, useAddDocumentToEleve } from '../api';
import { logger } from '../../../shared/utils/logger';
import type { TDocumentStatus } from '../types';

interface DocumentsStatusProps {
  eleveId: string;
  inscriptionId?: string;
  readonly?: boolean;
}

/**
 * Composant affichant le statut des documents d'un élève
 * - Documents fournis avec date et statut
 * - Documents manquants avec indicateur
 * - Actions pour marquer un document comme fourni
 */
export function DocumentsStatus({ eleveId, inscriptionId, readonly = false }: DocumentsStatusProps) {
  logger.feature('DocumentsStatus', 'Affichage statut documents', { eleveId, readonly });
  
  const { data: documentsStatus, isLoading, isError } = useDocumentsStatus(eleveId);
  const addDocumentMutation = useAddDocumentToEleve();

  const handleMarkAsFourni = async (typeDocumentId: string) => {
    if (!inscriptionId) {
      logger.feature('DocumentsStatus', 'Impossible de marquer document comme fourni - inscription_id manquant');
      return;
    }

    try {
      await addDocumentMutation.mutateAsync({
        eleve_id: eleveId,
        type_document_id: typeDocumentId,
        inscription_id: inscriptionId,
        statut: 'fourni',
      });
      logger.feature('DocumentsStatus', 'Document marqué comme fourni avec succès');
    } catch (error) {
      logger.feature('DocumentsStatus', 'Erreur lors du marquage du document', error);
    }
  };

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600 text-sm">
            ❌ Erreur lors du chargement des documents
          </span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">📄 Documents</h4>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!documentsStatus || documentsStatus.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-2 block">📄</span>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun document requis</h4>
        <p className="text-sm text-gray-500">
          Aucun type de document n'est configuré pour cette école.
        </p>
      </div>
    );
  }

  const documentsObligatoires = documentsStatus.filter(doc => doc.est_obligatoire);
  const documentsOptionnels = documentsStatus.filter(doc => !doc.est_obligatoire);
  const documentsFournis = documentsStatus.filter(doc => doc.statut === 'fourni');
  const documentsManquants = documentsStatus.filter(doc => doc.statut === 'manquant');

  const tauxCompletion = documentsObligatoires.length > 0 
    ? Math.round((documentsObligatoires.filter(doc => doc.statut === 'fourni').length / documentsObligatoires.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">📄 Documents</h4>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-green-600">
            ✅ {documentsFournis.length} fournis
          </span>
          <span className="text-red-600">
            ❌ {documentsManquants.length} manquants
          </span>
          <span className={`font-medium ${tauxCompletion === 100 ? 'text-green-600' : 'text-orange-600'}`}>
            {tauxCompletion}% complété
          </span>
        </div>
      </div>

      {/* Barre de progression pour documents obligatoires */}
      {documentsObligatoires.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              tauxCompletion === 100 ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${tauxCompletion}%` }}
          ></div>
        </div>
      )}

      {/* Documents obligatoires */}
      {documentsObligatoires.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-red-700 flex items-center">
            🔴 Documents obligatoires ({documentsObligatoires.length})
          </h5>
          {documentsObligatoires.map((doc) => (
            <DocumentStatusItem 
              key={doc.id}
              document={doc}
              onMarkAsFourni={readonly ? undefined : handleMarkAsFourni}
              isLoading={addDocumentMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Documents optionnels */}
      {documentsOptionnels.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-yellow-700 flex items-center">
            🟡 Documents optionnels ({documentsOptionnels.length})
          </h5>
          {documentsOptionnels.map((doc) => (
            <DocumentStatusItem 
              key={doc.id}
              document={doc}
              onMarkAsFourni={readonly ? undefined : handleMarkAsFourni}
              isLoading={addDocumentMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant pour un item de document
function DocumentStatusItem({ 
  document, 
  onMarkAsFourni, 
  isLoading 
}: {
  document: TDocumentStatus;
  onMarkAsFourni?: (typeDocumentId: string) => void;
  isLoading?: boolean;
}) {
  const isFourni = document.statut === 'fourni';
  
  return (
    <div className={`p-3 rounded-lg border ${
      isFourni 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">
            {isFourni ? '✅' : '❌'}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {document.nom}
            </p>
            {document.description && (
              <p className="text-xs text-gray-500 mt-1">
                {document.description}
              </p>
            )}
            {isFourni && document.date_fourni && (
              <p className="text-xs text-green-600 mt-1">
                Fourni le {new Date(document.date_fourni).toLocaleDateString('fr-FR')}
              </p>
            )}
            {document.observation && (
              <p className="text-xs text-gray-600 mt-1 italic">
                {document.observation}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            document.est_obligatoire
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {document.est_obligatoire ? 'Obligatoire' : 'Optionnel'}
          </span>
          
          {!isFourni && onMarkAsFourni && (
            <button
              onClick={() => onMarkAsFourni(document.id)}
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Marquer fourni'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}