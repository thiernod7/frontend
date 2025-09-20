import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { TAnneeScolaire } from '../../classes/types';

interface SituationFinanciereProps {
  searchTerm: string;
  currentYear?: TAnneeScolaire;
}

const SituationFinanciere: React.FC<SituationFinanciereProps> = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Consultation Situation Financière
        </h3>
        <p className="text-gray-500 mb-4">
          Interface de consultation des situations financières en cours de développement
        </p>
        <div className="text-sm text-gray-400">
          <p>Fonctionnalités prévues :</p>
          <ul className="mt-2 space-y-1">
            <li>• Recherche d'élèves</li>
            <li>• Soldes et paiements détaillés</li>
            <li>• Historique des versements</li>
            <li>• Export des relevés</li>
            <li>• Statuts financiers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SituationFinanciere;