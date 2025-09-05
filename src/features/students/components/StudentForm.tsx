import { useState } from 'react';
import { useCreateInscription } from '../api';
import { useClasses, useCurrentYear } from '../../classes/api';
import type { TInscriptionCreate } from '../types';

interface StudentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
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
  const { data: currentYear, isLoading: yearLoading, error: yearError } = useCurrentYear();  const handleInputChange = (field: keyof FormData, value: string) => {
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
          <div className="space-y-6 text-center">
            <div className="py-8">
              <span className="text-6xl">👨‍👩‍👧‍👦</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Parents (optionnel)
              </h3>
              <p className="text-gray-600 mt-2">
                Cette étape sera développée dans une prochaine version.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Pour l'instant, seul le tuteur est obligatoire et suffisant.
              </p>
            </div>
          </div>
        )}

        {/* Étape 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl">📸</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">
                Photos (optionnel)
              </h3>
              <p className="text-gray-600 mt-2">
                Ajoutez les photos de l'élève et du tuteur si disponibles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de l'élève
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange('eleve', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo du tuteur
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange('tuteur', e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-2">📋 Récapitulatif</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Élève:</strong> {formData.prenom} {formData.nom}</p>
                <p><strong>Tuteur:</strong> {formData.tuteur_prenom} {formData.tuteur_nom}</p>
                <p><strong>Téléphone:</strong> {formData.tuteur_telephone}</p>
                {currentYear && (
                  <p><strong>Année scolaire:</strong> {currentYear.nom}</p>
                )}
                {classes && formData.classe_id && (
                  <p><strong>Classe:</strong> {classes.find(c => c.id === formData.classe_id)?.nom}</p>
                )}
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
