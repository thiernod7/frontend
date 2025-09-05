import React, { useState } from 'react';
import { Plus, Search, GraduationCap, Users, BookOpen } from 'lucide-react';
import { useClasses, useCurrentYear, useCycles, useNiveaux } from './api';
import ClassesList from './components/ClassesList';
import ClasseForm from './components/ClasseForm';
import CycleManager from './components/CycleManager';
import NiveauManager from './components/NiveauManager';

type TabType = 'classes' | 'cycles' | 'niveaux';

const ClassesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [showClasseForm, setShowClasseForm] = useState(false);
  const [selectedClasseId, setSelectedClasseId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Data fetching
  const { data: currentYear } = useCurrentYear();
  const { data: classes, isLoading: classesLoading } = useClasses({
    annee_scolaire_id: currentYear?.id,
    active_only: showActiveOnly,
  });
  const { data: cycles, isLoading: cyclesLoading } = useCycles({ active_only: showActiveOnly });
  const { data: niveaux, isLoading: niveauxLoading } = useNiveaux({ active_only: showActiveOnly });

  // Filter classes by search
  const filteredClasses = classes?.filter(classe =>
    classe.nom.toLowerCase().includes(search.toLowerCase()) ||
    classe.niveau?.nom?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleCreateClasse = () => {
    setSelectedClasseId(null);
    setShowClasseForm(true);
  };

  const handleEditClasse = (id: string) => {
    setSelectedClasseId(id);
    setShowClasseForm(true);
  };

  const tabs = [
    {
      id: 'classes' as TabType,
      label: 'Classes',
      icon: GraduationCap,
      count: classes?.length || 0,
    },
    {
      id: 'cycles' as TabType,
      label: 'Cycles',
      icon: Users,
      count: cycles?.length || 0,
    },
    {
      id: 'niveaux' as TabType,
      label: 'Niveaux',
      icon: BookOpen,
      count: niveaux?.length || 0,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des Classes
        </h1>
        <p className="text-gray-600">
          Gérez les classes, cycles et niveaux scolaires
          {currentYear && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Rechercher ${activeTab === 'classes' ? 'des classes' : activeTab === 'cycles' ? 'des cycles' : 'des niveaux'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Actifs seulement
          </label>

          {activeTab === 'classes' && (
            <button
              onClick={handleCreateClasse}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle classe
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'classes' && (
          <ClassesList
            classes={filteredClasses}
            isLoading={classesLoading}
            onEdit={handleEditClasse}
          />
        )}

        {activeTab === 'cycles' && (
          <CycleManager
            cycles={cycles || []}
            isLoading={cyclesLoading}
            searchTerm={search}
          />
        )}

        {activeTab === 'niveaux' && (
          <NiveauManager
            niveaux={niveaux || []}
            cycles={cycles || []}
            isLoading={niveauxLoading || cyclesLoading}
            searchTerm={search}
          />
        )}
      </div>

      {/* Modals */}
      {showClasseForm && (
        <ClasseForm
          classeId={selectedClasseId}
          onClose={() => {
            setShowClasseForm(false);
            setSelectedClasseId(null);
          }}
        />
      )}
    </div>
  );
};

export default ClassesPage;
