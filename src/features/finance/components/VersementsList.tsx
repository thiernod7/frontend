import React from 'react';
import { CreditCard } from 'lucide-react';
import type { TAnneeScolaire } from '../../classes/types';

interface VersmentsListProps {
  searchTerm: string;
  currentYear?: TAnneeScolaire;
}

const VersementsList: React.FC<VersmentsListProps> = ({ searchTerm, currentYear }) => {
  // TODO: Implémenter la logique de filtrage des versements
  console.log('VersementsList', { searchTerm, currentYear });
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Gestion des Versements
        </h3>
        <p className="text-gray-500 mb-4">
          Interface de gestion des paiements en cours de développement
        </p>
        <div className="text-sm text-gray-400">
          <p>Fonctionnalités prévues :</p>
          <ul className="mt-2 space-y-1">
            <li>• Enregistrement des paiements</li>
            <li>• Historique des versements</li>
            <li>• Génération de reçus</li>
            <li>• Suivi des modes de paiement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VersementsList;