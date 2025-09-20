import { useState, useMemo } from 'react';
import { useClasses } from '../../classes/api';
import { useFrais, useTypesFrais } from '../api';
import { formatMontantGNF } from '../../../shared/utils/currency';

interface FraisCalculatorProps {
  onClose: () => void;
}

interface EleveCalcul {
  id: string;
  numero: number;
  classe_id: string;
  classe_nom: string;
  types_frais_selectionnes: string[]; // IDs des types de frais sélectionnés
  nombre_mois: number;
  frais_total: number;
}

export default function FraisCalculator({ onClose }: FraisCalculatorProps) {
  const [eleves, setEleves] = useState<EleveCalcul[]>([]);
  const [nouvelEleve, setNouvelEleve] = useState({
    classe_id: '',
    types_frais_selectionnes: [] as string[],
    nombre_mois: 1
  });

  // Récupération des données
  const { data: classes = [], isLoading: loadingClasses } = useClasses({ active_only: true });
  const { data: typesFrais = [], isLoading: loadingTypesFrais, error: errorTypesFrais } = useTypesFrais();
  const { data: fraisData = [], isLoading: loadingFrais } = useFrais({
    annee_scolaire_id: '2024-2025',
    cycle_id: '',
    niveau_id: ''
  });

  // Debug: afficher les données chargées
  console.log('🔍 Debug FraisCalculator:', {
    typesFrais: typesFrais,
    typesFraisCount: typesFrais.length,
    loadingTypesFrais,
    errorTypesFrais,
    nouvelEleve: nouvelEleve
  });

  // Fonction pour calculer les frais d'un élève
  const calculerFraisEleve = (types_frais_selectionnes: string[], nombre_mois: number) => {
    // Filtrer les frais selon les types sélectionnés
    const fraisApplicables = fraisData.filter(frais => 
      types_frais_selectionnes.includes(frais.type_frais_id)
    );

    // Identifier les frais mensuels (scolarité) et fixes
    const fraisMensuels = fraisApplicables
      .filter(f => f.type_frais?.nom?.toLowerCase().includes('scolarite'))
      .reduce((sum, frais) => sum + frais.montant, 0);
    
    const fraisFixe = fraisApplicables
      .filter(f => !f.type_frais?.nom?.toLowerCase().includes('scolarite'))
      .reduce((sum, frais) => sum + frais.montant, 0);

    return fraisFixe + (fraisMensuels * nombre_mois);
  };

  // Ajouter un élève au panier
  const ajouterEleve = () => {
    if (!nouvelEleve.classe_id || nouvelEleve.types_frais_selectionnes.length === 0) return;

    const classe = classes.find(c => c.id === nouvelEleve.classe_id);
    if (!classe) return;

    const fraisTotal = calculerFraisEleve(
      nouvelEleve.types_frais_selectionnes,
      nouvelEleve.nombre_mois
    );

    const eleve: EleveCalcul = {
      id: Date.now().toString(),
      numero: eleves.length + 1,
      classe_id: nouvelEleve.classe_id,
      classe_nom: classe.nom,
      types_frais_selectionnes: nouvelEleve.types_frais_selectionnes,
      nombre_mois: nouvelEleve.nombre_mois,
      frais_total: fraisTotal
    };

    setEleves(prev => [...prev, eleve]);
    
    // Reset du formulaire
    setNouvelEleve({
      classe_id: '',
      types_frais_selectionnes: [],
      nombre_mois: 1
    });
  };

  // Supprimer un élève
  const supprimerEleve = (id: string) => {
    setEleves(prev => prev.filter(e => e.id !== id));
  };

  // Calculer le total général
  const totalGeneral = useMemo(() => {
    return eleves.reduce((sum, eleve) => sum + eleve.frais_total, 0);
  }, [eleves]);

  // Export CSV
  const exportToCSV = () => {
    if (eleves.length === 0) return;

    const csvData = [
      ['N°', 'Classe', 'Types de Frais', 'Mois', 'Frais'],
      ...eleves.map(eleve => {
        const typesNames = eleve.types_frais_selectionnes
          .map(typeId => typesFrais.find(t => t.id === typeId)?.nom || typeId)
          .join(', ');
        return [
          eleve.numero.toString(),
          eleve.classe_nom,
          typesNames,
          eleve.nombre_mois.toString(),
          eleve.frais_total.toString()
        ];
      }),
      ['', '', '', 'TOTAL:', totalGeneral.toString()]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis_frais_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingClasses || loadingFrais || loadingTypesFrais) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  // Gestion d'erreur pour les types de frais
  if (errorTypesFrais) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          ❌ Erreur lors du chargement des types de frais
        </div>
        <p className="text-sm text-gray-600">
          Vérifiez que le backend est démarré et que vous êtes bien connecté.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulaire d'ajout - Plus petit */}
      <div className="lg:col-span-1 space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Ajouter un élève</h4>
        
        {/* Classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classe
          </label>
          <select
            value={nouvelEleve.classe_id}
            onChange={(e) => setNouvelEleve(prev => ({ ...prev, classe_id: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Types de frais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Types de frais ({nouvelEleve.types_frais_selectionnes.length} sélectionné{nouvelEleve.types_frais_selectionnes.length > 1 ? 's' : ''})
          </label>
          
          {/* Boutons de sélection rapide */}
          {typesFrais.length > 0 && (
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  const inscriptionTypes = typesFrais
                    .filter(t => t.nom.toLowerCase().includes('inscription') || t.nom.toLowerCase().includes('scolarite'))
                    .map(t => t.id);
                  setNouvelEleve(prev => ({ ...prev, types_frais_selectionnes: inscriptionTypes }));
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                📝 Inscription
              </button>
              <button
                type="button"
                onClick={() => {
                  const reinscriptionTypes = typesFrais
                    .filter(t => t.nom.toLowerCase().includes('reinscription') || t.nom.toLowerCase().includes('scolarite'))
                    .map(t => t.id);
                  setNouvelEleve(prev => ({ ...prev, types_frais_selectionnes: reinscriptionTypes }));
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                🔄 Réinscription
              </button>
              <button
                type="button"
                onClick={() => setNouvelEleve(prev => ({ ...prev, types_frais_selectionnes: [] }))}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                ❌ Vider
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {typesFrais.length > 0 ? (
              typesFrais.map(typeFrais => {
                const isChecked = nouvelEleve.types_frais_selectionnes.includes(typeFrais.id);
                console.log(`🔍 Type ${typeFrais.nom} (${typeFrais.id}): checked=${isChecked}`, {
                  typeFraisId: typeFrais.id,
                  selectedIds: nouvelEleve.types_frais_selectionnes,
                  includes: nouvelEleve.types_frais_selectionnes.includes(typeFrais.id)
                });
                
                return (
                  <label key={typeFrais.id} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        console.log(`🔄 Checkbox changed for ${typeFrais.nom}:`, e.target.checked);
                        if (e.target.checked) {
                          setNouvelEleve(prev => {
                            const newSelection = [...prev.types_frais_selectionnes, typeFrais.id];
                            console.log('➕ Adding type, new selection:', newSelection);
                            return { ...prev, types_frais_selectionnes: newSelection };
                          });
                        } else {
                          setNouvelEleve(prev => {
                            const newSelection = prev.types_frais_selectionnes.filter(id => id !== typeFrais.id);
                            console.log('➖ Removing type, new selection:', newSelection);
                            return { ...prev, types_frais_selectionnes: newSelection };
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="flex-1">{typeFrais.nom}</span>
                    {typeFrais.description && (
                      <span className="text-xs text-gray-500 ml-2">({typeFrais.description})</span>
                    )}
                  </label>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-orange-600 mb-2">⚠️ Aucun type de frais configuré</p>
                <p className="text-xs text-gray-500">
                  Le backend doit avoir des types de frais configurés pour utiliser le calculateur.
                  <br />
                  Contactez l'administrateur pour ajouter des types de frais.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nombre de mois */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de mois ({nouvelEleve.nombre_mois})
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="10"
              value={nouvelEleve.nombre_mois}
              onChange={(e) => setNouvelEleve(prev => ({ ...prev, nombre_mois: parseInt(e.target.value) }))}
              className="flex-1"
            />
            <div className="flex space-x-1">
              <button
                onClick={() => setNouvelEleve(prev => ({ ...prev, nombre_mois: Math.max(1, prev.nombre_mois - 1) }))}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
              >
                -
              </button>
              <button
                onClick={() => setNouvelEleve(prev => ({ ...prev, nombre_mois: Math.min(10, prev.nombre_mois + 1) }))}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <button
          onClick={ajouterEleve}
          disabled={!nouvelEleve.classe_id || nouvelEleve.types_frais_selectionnes.length === 0}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          ➕ Ajouter
        </button>
      </div>

      {/* Panier et résultats - Plus grand */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">
            Panier ({eleves.length} élève{eleves.length > 1 ? 's' : ''})
          </h4>
          {eleves.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              📄 Export
            </button>
          )}
        </div>

        {eleves.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">Aucun élève ajouté au panier</p>
            <p className="text-sm text-gray-400 mt-1">Remplissez le formulaire et cliquez sur "Ajouter au panier"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tableau des élèves */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N°
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Types de Frais
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mois
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frais
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eleves.map((eleve) => (
                    <tr key={eleve.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {eleve.numero}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {eleve.classe_nom}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {eleve.types_frais_selectionnes.map(typeId => {
                            const typeFrais = typesFrais.find(t => t.id === typeId);
                            return (
                              <span 
                                key={typeId}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                              >
                                {typeFrais?.nom || typeId}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {eleve.nombre_mois}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatMontantGNF(eleve.frais_total)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => supprimerEleve(eleve.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-sm font-medium text-blue-900">
                      TOTAL GÉNÉRAL
                    </td>
                    <td className="px-4 py-4 text-lg font-bold text-blue-900">
                      {formatMontantGNF(totalGeneral)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-blue-600">
                        {eleves.length} élève{eleves.length > 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Actions du panier */}
            <div className="flex space-x-3">
              <button
                onClick={() => setEleves([])}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️ Vider le panier
              </button>
            </div>
          </div>
        )}

        {/* Bouton fermer */}
        <div className="lg:col-span-3 flex justify-center pt-4 border-t">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}