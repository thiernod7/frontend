import React, { useState } from 'react';
import { Plus, Search, DollarSign, CreditCard, TrendingUp, Settings } from 'lucide-react';
import { useCurrentYear } from '../classes/api';
import { logger } from '../../shared/utils/logger';
import FraisList from './components/FraisList';
import VersementsList from './components/VersementsList';
import SituationFinanciere from './components/SituationFinanciere';
import FraisForm from './components/FraisForm';
import TypeFraisManager from './components/TypeFraisManager';

type TabType = 'frais' | 'versements' | 'situation' | 'types-frais';

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('frais');
  const [showFraisForm, setShowFraisForm] = useState(false);
  const [selectedFraisId, setSelectedFraisId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Data fetching
  const { data: currentYear } = useCurrentYear();

  logger.feature('FinancePage', 'Page finance chargée', { activeTab });

  const handleCreateFrais = () => {
    setSelectedFraisId(null);
    setShowFraisForm(true);
  };

  const handleEditFrais = (id: string) => {
    setSelectedFraisId(id);
    setShowFraisForm(true);
  };

  const tabs = [
    {
      id: 'types-frais' as TabType,
      label: 'Types de Frais',
      icon: Settings,
      description: 'Configurer les types de frais',
    },
    {
      id: 'frais' as TabType,
      label: 'Gestion des Frais',
      icon: DollarSign,
      description: 'Définir et gérer les frais scolaires',
    },
    {
      id: 'versements' as TabType,
      label: 'Versements',
      icon: CreditCard,
      description: 'Enregistrer les paiements des élèves',
    },
    {
      id: 'situation' as TabType,
      label: 'Situation Financière',
      icon: TrendingUp,
      description: 'Consulter les situations financières',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion Financière
        </h1>
        <p className="text-gray-600">
          Gérez les frais scolaires, versements et suivez les situations financières
          {currentYear && (
            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              Année: {currentYear.nom}
            </span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs text-gray-400 font-normal">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search & Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Rechercher...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(activeTab === 'frais' || activeTab === 'types-frais') && (
            <button
              onClick={handleCreateFrais}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'types-frais' ? 'Nouveau type' : 'Nouveau frais'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'types-frais' && (
          <div className="p-6">
            <TypeFraisManager />
          </div>
        )}

        {activeTab === 'frais' && (
          <FraisList
            searchTerm={search}
            onEdit={handleEditFrais}
            currentYear={currentYear}
          />
        )}

        {activeTab === 'versements' && (
          <VersementsList
            searchTerm={search}
            currentYear={currentYear}
          />
        )}

        {activeTab === 'situation' && (
          <SituationFinanciere
            searchTerm={search}
            currentYear={currentYear}
          />
        )}
      </div>

      {/* Modals */}
      {showFraisForm && (
        <FraisForm
          fraisId={selectedFraisId}
          onClose={() => {
            setShowFraisForm(false);
            setSelectedFraisId(null);
          }}
        />
      )}
    </div>
  );
};

export default FinancePage;