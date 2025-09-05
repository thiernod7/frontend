import { useState } from 'react';
import { useCreateInscription, useSearchParents } from '../api';
import { useClasses, useCurrentYear } from '../../classes/api';
import type { TInscriptionCreate } from '../types';

interface StudentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type ParentMode = 'none' | 'new' | 'existing';

interface SearchedParent {
  id: string;
  personne: {
    nom: string;
    prenom: string;
    telephone: string;
    adresse_quartier: string;
  };
  profession?: string;
  lieu_travail?: string;
}

interface FormData {
  // Étape 1: Informations élève
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  date_naissance: string;
  lieu_naissance: string;
  telephone: string;
  adresse_quartier: string;
  classe_id: string;
  
  // Étape 2: Tuteur
  tuteur_nom: string;
  tuteur_prenom: string;
  tuteur_sexe: 'M' | 'F';
  tuteur_telephone: string;
  tuteur_adresse: string;
  tuteur_profession: string;
  tuteur_lieu_travail: string;
  
  // Étape 3: Parents (optionnels)
  pere_mode: ParentMode;
  pere_id: string;
  pere_nom: string;
  pere_prenom: string;
  pere_sexe: 'M' | 'F';
  pere_telephone: string;
  pere_adresse: string;
  pere_profession: string;
  pere_lieu_travail: string;
  
  mere_mode: ParentMode;
  mere_id: string;
  mere_nom: string;
  mere_prenom: string;
  mere_sexe: 'M' | 'F';
  mere_telephone: string;
  mere_adresse: string;
  mere_profession: string;
  mere_lieu_travail: string;
}

export function StudentForm({ onSuccess, onCancel }: StudentFormProps) {
  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // 1: Élève, 2: Tuteur, 3: Parents, 4: Photos, 5: Soumission
  
  // États pour les données du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    telephone: '',
    adresse_quartier: '',
    classe_id: '',
    tuteur_nom: '',
    tuteur_prenom: '',
    tuteur_sexe: 'F',
    tuteur_telephone: '',
    tuteur_adresse: '',
    tuteur_profession: '',
    tuteur_lieu_travail: '',
    
    // Parents - initialisés vides
    pere_mode: 'none',
    pere_id: '',
    pere_nom: '',
    pere_prenom: '',
    pere_sexe: 'M',
    pere_telephone: '',
    pere_adresse: '',
    pere_profession: '',
    pere_lieu_travail: '',
    
    mere_mode: 'none',
    mere_id: '',
    mere_nom: '',
    mere_prenom: '',
    mere_sexe: 'F',
    mere_telephone: '',
    mere_adresse: '',
    mere_profession: '',
    mere_lieu_travail: '',
  });

  // États pour les photos
  const [photos, setPhotos] = useState<{
    eleve?: File;
    tuteur?: File;
    pere?: File;
    mere?: File;
  }>({});
  
  // Hooks API
  const createInscriptionMutation = useCreateInscription();
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: currentYear, isLoading: yearLoading, error: yearError } = useCurrentYear();
  
  // États pour la recherche de parents
  const [parentSearchTerms, setParentSearchTerms] = useState({
    pere: '',
    mere: ''
  });
  
  // Recherche de parents (seulement si au moins 3 caractères)
  const { data: pereSearchResults } = useSearchParents(
    parentSearchTerms.pere.length >= 3 ? parentSearchTerms.pere : ''
  );
  const { data: mereSearchResults } = useSearchParents(
    parentSearchTerms.mere.length >= 3 ? parentSearchTerms.mere : ''
  );  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (type: keyof typeof photos, file: File | null) => {
    setPhotos(prev => ({
      ...prev,
      [type]: file || undefined
    }));
  };

  // Handlers pour la gestion des parents
  const handleParentModeChange = (parent: 'pere' | 'mere', mode: ParentMode) => {
    const modeField = `${parent}_mode` as keyof FormData;
    setFormData(prev => ({
      ...prev,
      [modeField]: mode,
      // Reset les données du parent quand on change de mode
      [`${parent}_id`]: '',
      [`${parent}_nom`]: '',
      [`${parent}_prenom`]: '',
      [`${parent}_telephone`]: '',
      [`${parent}_adresse`]: '',
      [`${parent}_profession`]: '',
      [`${parent}_lieu_travail`]: '',
    }));
  };

  const handleParentSearchChange = (parent: 'pere' | 'mere', searchTerm: string) => {
    setParentSearchTerms(prev => ({
      ...prev,
      [parent]: searchTerm
    }));
  };

  const handleExistingParentSelect = (parent: 'pere' | 'mere', selectedParent: SearchedParent) => {
    const idField = `${parent}_id` as keyof FormData;
    const nomField = `${parent}_nom` as keyof FormData;
    const prenomField = `${parent}_prenom` as keyof FormData;
    const telephoneField = `${parent}_telephone` as keyof FormData;
    const adresseField = `${parent}_adresse` as keyof FormData;
    const professionField = `${parent}_profession` as keyof FormData;
    const lieuTravailField = `${parent}_lieu_travail` as keyof FormData;

    setFormData(prev => ({
      ...prev,
      [idField]: selectedParent.id,
      [nomField]: selectedParent.personne.nom,
      [prenomField]: selectedParent.personne.prenom,
      [telephoneField]: selectedParent.personne.telephone,
      [adresseField]: selectedParent.personne.adresse_quartier,
      [professionField]: selectedParent.profession || '',
      [lieuTravailField]: selectedParent.lieu_travail || '',
    }));

    // Vider la recherche
    setParentSearchTerms(prev => ({
      ...prev,
      [parent]: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      // Aller à l'étape suivante
      setCurrentStep(currentStep + 1);
      return;
    }

    // Dernière étape : soumettre
    try {
      if (!currentYear) {
        throw new Error('Année scolaire courante non disponible');
      }

      const inscriptionData: TInscriptionCreate = {
        eleve: {
          nom: formData.nom,
          prenom: formData.prenom,
          sexe: formData.sexe,
          telephone: formData.telephone,
          adresse_quartier: formData.adresse_quartier,
          date_naissance: formData.date_naissance,
          lieu_naissance: formData.lieu_naissance,
        },
        
        tuteur: {
          data: {
            nom: formData.tuteur_nom,
            prenom: formData.tuteur_prenom,
            sexe: formData.tuteur_sexe,
            telephone: formData.tuteur_telephone,
            adresse_quartier: formData.tuteur_adresse,
            profession: formData.tuteur_profession,
            lieu_travail: formData.tuteur_lieu_travail,
          }
        },
        
        // Père (optionnel)
        ...(formData.pere_mode !== 'none' && {
          pere: formData.pere_mode === 'existing' 
            ? { id: formData.pere_id }
            : {
                data: {
                  nom: formData.pere_nom,
                  prenom: formData.pere_prenom,
                  sexe: formData.pere_sexe,
                  telephone: formData.pere_telephone,
                  adresse_quartier: formData.pere_adresse,
                  profession: formData.pere_profession,
                  lieu_travail: formData.pere_lieu_travail,
                }
              }
        }),
        
        // Mère (optionnelle)
        ...(formData.mere_mode !== 'none' && {
          mere: formData.mere_mode === 'existing' 
            ? { id: formData.mere_id }
            : {
                data: {
                  nom: formData.mere_nom,
                  prenom: formData.mere_prenom,
                  sexe: formData.mere_sexe,
                  telephone: formData.mere_telephone,
                  adresse_quartier: formData.mere_adresse,
                  profession: formData.mere_profession,
                  lieu_travail: formData.mere_lieu_travail,
                }
              }
        }),
        
        classe_id: formData.classe_id,
        annee_scolaire_id: currentYear.id,
      };
      
      const submissionData = {
        inscription_data: JSON.stringify(inscriptionData),
        photo_eleve: photos.eleve,
        photo_tuteur: photos.tuteur,
        photo_pere: photos.pere,
        photo_mere: photos.mere,
      };
      
      await createInscriptionMutation.mutateAsync(submissionData);
      onSuccess?.();
      
    } catch (error) {
      console.error('❌ [STUDENT-FORM] Erreur création élève:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const stepTitles = [
    '👤 Informations élève',
    '👥 Famille (Tuteur)',
    '👨‍👩‍👧‍👦 Parents (optionnel)',
    '📸 Photos & Finalisation'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {stepTitles.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 === currentStep
                    ? 'bg-indigo-600 text-white'
                    : index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1 < currentStep ? '✓' : index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {stepTitles[currentStep - 1]}
          </h3>
          <p className="text-sm text-gray-500">
            Étape {currentStep} sur {totalSteps}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1: Informations élève */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Jean"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Dupont"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sexe *
                </label>
                <select
                  value={formData.sexe}
                  onChange={(e) => handleInputChange('sexe', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.date_naissance}
                  onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: +225 01 02 03 04 05"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lieu de naissance *
              </label>
              <input
                type="text"
                value={formData.lieu_naissance}
                onChange={(e) => handleInputChange('lieu_naissance', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Abidjan, Côte d'Ivoire"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse / Quartier *
              </label>
              <textarea
                rows={2}
                value={formData.adresse_quartier}
                onChange={(e) => handleInputChange('adresse_quartier', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Cocody, Riviera 3, Rue des Jardins"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Classe *
              </label>
              <select
                value={formData.classe_id}
                onChange={(e) => handleInputChange('classe_id', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={classesLoading}
              >
                <option value="">Sélectionnez une classe</option>
                {classes?.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
              </select>
              {classesLoading && (
                <p className="mt-1 text-sm text-gray-500">Chargement des classes...</p>
              )}
            </div>

            {/* Affichage année scolaire */}
            {yearLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-600 text-sm">
                  📅 <strong>Année scolaire:</strong> Chargement...
                </p>
              </div>
            )}
            
            {yearError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">
                  ❌ <strong>Erreur année scolaire:</strong> {yearError.message}
                </p>
              </div>
            )}
            
            {currentYear && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800 text-sm">
                  📅 <strong>Année scolaire:</strong> {currentYear.nom}
                </p>
              </div>
            )}
            
            {!yearLoading && !yearError && !currentYear && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>Aucune année scolaire courante définie</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Étape 2: Tuteur */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <h4 className="text-yellow-800 font-medium">👥 Informations du Tuteur</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Le tuteur est <strong>obligatoire</strong> et sera la personne de contact principale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom du tuteur *
                </label>
                <input
                  type="text"
                  value={formData.tuteur_prenom}
                  onChange={(e) => handleInputChange('tuteur_prenom', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Marie"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom du tuteur *
                </label>
                <input
                  type="text"
                  value={formData.tuteur_nom}
                  onChange={(e) => handleInputChange('tuteur_nom', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Dupont"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sexe *
                </label>
                <select
                  value={formData.tuteur_sexe}
                  onChange={(e) => handleInputChange('tuteur_sexe', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.tuteur_telephone}
                  onChange={(e) => handleInputChange('tuteur_telephone', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: +225 07 08 09 10 11"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profession
                </label>
                <input
                  type="text"
                  value={formData.tuteur_profession}
                  onChange={(e) => handleInputChange('tuteur_profession', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Enseignante"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse / Quartier *
              </label>
              <textarea
                rows={2}
                value={formData.tuteur_adresse}
                onChange={(e) => handleInputChange('tuteur_adresse', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Marcory, Zone 4C"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lieu de travail
              </label>
              <input
                type="text"
                value={formData.tuteur_lieu_travail}
                onChange={(e) => handleInputChange('tuteur_lieu_travail', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: École Primaire Sainte-Marie"
              />
            </div>
          </div>
        )}

        {/* Étape 3: Parents optionnels */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <span className="text-6xl">👨‍👩‍👧‍👦</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Parents (optionnel)
              </h3>
              <p className="text-gray-600 mt-2">
                Ajoutez les informations du père et de la mère si souhaité.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Vous pouvez rechercher des parents existants ou en créer de nouveaux.
              </p>
            </div>

            {/* Interface à onglets Père/Mère */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Section Père */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">👨</span>
                    <h4 className="text-lg font-semibold text-gray-900">Père</h4>
                  </div>
                  
                  {/* Sélection mode père */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options pour le père
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="pere_mode"
                          value="none"
                          checked={formData.pere_mode === 'none'}
                          onChange={(e) => handleParentModeChange('pere', e.target.value as ParentMode)}
                          className="mr-2"
                        />
                        <span className="text-sm">Pas de père à renseigner</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="pere_mode"
                          value="existing"
                          checked={formData.pere_mode === 'existing'}
                          onChange={(e) => handleParentModeChange('pere', e.target.value as ParentMode)}
                          className="mr-2"
                        />
                        <span className="text-sm">Rechercher un père existant</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="pere_mode"
                          value="new"
                          checked={formData.pere_mode === 'new'}
                          onChange={(e) => handleParentModeChange('pere', e.target.value as ParentMode)}
                          className="mr-2"
                        />
                        <span className="text-sm">Créer un nouveau père</span>
                      </label>
                    </div>
                  </div>

                  {/* Recherche père existant */}
                  {formData.pere_mode === 'existing' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rechercher un père
                        </label>
                        <input
                          type="text"
                          placeholder="Nom ou prénom du père..."
                          value={parentSearchTerms.pere}
                          onChange={(e) => handleParentSearchChange('pere', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      {/* Résultats recherche père */}
                      {pereSearchResults && pereSearchResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                          {pereSearchResults.map((parent: SearchedParent) => (
                            <button
                              key={parent.id}
                              type="button"
                              onClick={() => handleExistingParentSelect('pere', parent)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{parent.personne.prenom} {parent.personne.nom}</div>
                              <div className="text-sm text-gray-500">{parent.personne.telephone}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Père sélectionné */}
                      {formData.pere_id && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                          <p className="text-sm text-blue-800">
                            <strong>Père sélectionné:</strong> {formData.pere_prenom} {formData.pere_nom}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulaire nouveau père */}
                  {formData.pere_mode === 'new' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                          <input
                            type="text"
                            value={formData.pere_prenom}
                            onChange={(e) => handleInputChange('pere_prenom', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom *</label>
                          <input
                            type="text"
                            value={formData.pere_nom}
                            onChange={(e) => handleInputChange('pere_nom', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
                        <input
                          type="tel"
                          value={formData.pere_telephone}
                          onChange={(e) => handleInputChange('pere_telephone', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse *</label>
                        <textarea
                          rows={2}
                          value={formData.pere_adresse}
                          onChange={(e) => handleInputChange('pere_adresse', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Profession</label>
                          <input
                            type="text"
                            value={formData.pere_profession}
                            onChange={(e) => handleInputChange('pere_profession', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Lieu de travail</label>
                          <input
                            type="text"
                            value={formData.pere_lieu_travail}
                            onChange={(e) => handleInputChange('pere_lieu_travail', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Mère */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">👩</span>
                    <h4 className="text-lg font-semibold text-gray-900">Mère</h4>
                  </div>
                  
                  {/* Sélection mode mère */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options pour la mère
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mere_mode"
                          value="none"
                          checked={formData.mere_mode === 'none'}
                          onChange={(e) => handleParentModeChange('mere', e.target.value as ParentMode)}
                          className="mr-2"
                        />
                        <span className="text-sm">Pas de mère à renseigner</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mere_mode"
                          value="existing"
                          checked={formData.mere_mode === 'existing'}
                          onChange={(e) => handleParentModeChange('mere', e.target.value as ParentMode)}
                          className="mr-2"
                        />
                        <span className="text-sm">Rechercher une mère existante</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mere_mode"
                          value="new"
                          checked={formData.mere_mode === 'new'}
                          onChange={(e) => handleParentModeChange('mere', e.target.value as ParentMode)}
                          className="mr-2"
                        />
                        <span className="text-sm">Créer une nouvelle mère</span>
                      </label>
                    </div>
                  </div>

                  {/* Recherche mère existante */}
                  {formData.mere_mode === 'existing' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rechercher une mère
                        </label>
                        <input
                          type="text"
                          placeholder="Nom ou prénom de la mère..."
                          value={parentSearchTerms.mere}
                          onChange={(e) => handleParentSearchChange('mere', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      {/* Résultats recherche mère */}
                      {mereSearchResults && mereSearchResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                          {mereSearchResults.map((parent: SearchedParent) => (
                            <button
                              key={parent.id}
                              type="button"
                              onClick={() => handleExistingParentSelect('mere', parent)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{parent.personne.prenom} {parent.personne.nom}</div>
                              <div className="text-sm text-gray-500">{parent.personne.telephone}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Mère sélectionnée */}
                      {formData.mere_id && (
                        <div className="bg-pink-50 border border-pink-200 rounded-md p-3">
                          <p className="text-sm text-pink-800">
                            <strong>Mère sélectionnée:</strong> {formData.mere_prenom} {formData.mere_nom}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulaire nouvelle mère */}
                  {formData.mere_mode === 'new' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                          <input
                            type="text"
                            value={formData.mere_prenom}
                            onChange={(e) => handleInputChange('mere_prenom', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom *</label>
                          <input
                            type="text"
                            value={formData.mere_nom}
                            onChange={(e) => handleInputChange('mere_nom', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone *</label>
                        <input
                          type="tel"
                          value={formData.mere_telephone}
                          onChange={(e) => handleInputChange('mere_telephone', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse *</label>
                        <textarea
                          rows={2}
                          value={formData.mere_adresse}
                          onChange={(e) => handleInputChange('mere_adresse', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Profession</label>
                          <input
                            type="text"
                            value={formData.mere_profession}
                            onChange={(e) => handleInputChange('mere_profession', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Lieu de travail</label>
                          <input
                            type="text"
                            value={formData.mere_lieu_travail}
                            onChange={(e) => handleInputChange('mere_lieu_travail', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl">📸</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Photos & Finalisation
              </h3>
              <p className="text-gray-600 mt-2">
                Ajoutez les photos des personnes si disponibles, puis finalisez l'inscription.
              </p>
            </div>

            {/* Zone photos */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📷 Photos (optionnelles)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Photo élève */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Photo de l'élève
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange('eleve', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {photos.eleve && (
                    <p className="text-xs text-green-600 mt-1">✓ {photos.eleve.name}</p>
                  )}
                </div>

                {/* Photo tuteur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👥 Photo du tuteur
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange('tuteur', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {photos.tuteur && (
                    <p className="text-xs text-green-600 mt-1">✓ {photos.tuteur.name}</p>
                  )}
                </div>

                {/* Photo père (si configuré) */}
                {formData.pere_mode !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👨 Photo du père
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange('pere', e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {photos.pere && (
                      <p className="text-xs text-green-600 mt-1">✓ {photos.pere.name}</p>
                    )}
                  </div>
                )}

                {/* Photo mère (si configurée) */}
                {formData.mere_mode !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👩 Photo de la mère
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange('mere', e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                    {photos.mere && (
                      <p className="text-xs text-green-600 mt-1">✓ {photos.mere.name}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Récapitulatif complet */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Récapitulatif de l'inscription</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations élève */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">👤 Élève</h5>
                  <div className="text-sm text-gray-600 space-y-1 bg-white rounded-md p-3">
                    <p><strong>Nom complet:</strong> {formData.prenom} {formData.nom}</p>
                    <p><strong>Sexe:</strong> {formData.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                    <p><strong>Date de naissance:</strong> {formData.date_naissance ? new Date(formData.date_naissance).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                    <p><strong>Lieu de naissance:</strong> {formData.lieu_naissance || 'Non défini'}</p>
                    <p><strong>Téléphone:</strong> {formData.telephone || 'Non défini'}</p>
                    <p><strong>Adresse:</strong> {formData.adresse_quartier || 'Non définie'}</p>
                  </div>
                </div>

                {/* Informations scolaires */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">🏫 Scolarité</h5>
                  <div className="text-sm text-gray-600 space-y-1 bg-white rounded-md p-3">
                    {classes && formData.classe_id && (
                      <p><strong>Classe:</strong> {classes.find(c => c.id === formData.classe_id)?.nom}</p>
                    )}
                    {currentYear && (
                      <p><strong>Année scolaire:</strong> {currentYear.nom}</p>
                    )}
                  </div>
                </div>

                {/* Tuteur */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">👥 Tuteur (obligatoire)</h5>
                  <div className="text-sm text-gray-600 space-y-1 bg-white rounded-md p-3">
                    <p><strong>Nom complet:</strong> {formData.tuteur_prenom} {formData.tuteur_nom}</p>
                    <p><strong>Sexe:</strong> {formData.tuteur_sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                    <p><strong>Téléphone:</strong> {formData.tuteur_telephone}</p>
                    <p><strong>Adresse:</strong> {formData.tuteur_adresse}</p>
                    {formData.tuteur_profession && (
                      <p><strong>Profession:</strong> {formData.tuteur_profession}</p>
                    )}
                    {formData.tuteur_lieu_travail && (
                      <p><strong>Lieu de travail:</strong> {formData.tuteur_lieu_travail}</p>
                    )}
                  </div>
                </div>

                {/* Parents */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">👨‍👩‍👧‍👦 Parents</h5>
                  <div className="text-sm text-gray-600 space-y-2 bg-white rounded-md p-3">
                    {/* Père */}
                    <div>
                      <p className="font-medium">👨 Père:</p>
                      {formData.pere_mode === 'none' ? (
                        <p className="text-gray-500 ml-4">Non renseigné</p>
                      ) : formData.pere_mode === 'existing' ? (
                        <p className="ml-4 text-blue-600">Parent existant: {formData.pere_prenom} {formData.pere_nom}</p>
                      ) : (
                        <div className="ml-4">
                          <p>{formData.pere_prenom} {formData.pere_nom}</p>
                          <p>📞 {formData.pere_telephone}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Mère */}
                    <div>
                      <p className="font-medium">👩 Mère:</p>
                      {formData.mere_mode === 'none' ? (
                        <p className="text-gray-500 ml-4">Non renseignée</p>
                      ) : formData.mere_mode === 'existing' ? (
                        <p className="ml-4 text-pink-600">Parent existant: {formData.mere_prenom} {formData.mere_nom}</p>
                      ) : (
                        <div className="ml-4">
                          <p>{formData.mere_prenom} {formData.mere_nom}</p>
                          <p>📞 {formData.mere_telephone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                ← Précédent
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="submit"
                disabled={createInscriptionMutation.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createInscriptionMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Création...
                  </div>
                ) : (
                  '✓ Créer l\'élève (Demo)'
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* État mutation */}
      {createInscriptionMutation.isError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">
            ❌ Erreur lors de la création de l'élève. Veuillez réessayer.
          </p>
        </div>
      )}
    </div>
  );
}
