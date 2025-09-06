import { useStudentDetail } from '../api';
import { getPhotoUrl } from '../../../shared/utils/photos';

interface StudentDetailProps {
  studentId: string;
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const { data: student, isLoading, isError } = useStudentDetail(studentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="text-center py-6">
        <p className="text-red-600">❌ Erreur de chargement du détail élève</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations élève */}
      <div className="border-b pb-4">
        <div className="flex items-start gap-4">
          {/* Photo élève */}
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {student.personne.photo ? (
              <img 
                src={getPhotoUrl(student.personne.photo) || ''} 
                alt={`${student.personne.prenom} ${student.personne.nom}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-500 font-semibold text-xl">
                {student.personne.prenom.charAt(0)}{student.personne.nom.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {student.personne.prenom} {student.personne.nom}
            </h3>
            <p className="text-gray-600">Matricule: {student.numero_matricule}</p>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Date de naissance:</span>
                <p className="text-gray-600">
                  {new Date(student.date_naissance).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="font-medium">Lieu de naissance:</span>
                <p className="text-gray-600">{student.lieu_naissance}</p>
              </div>
              <div>
                <span className="font-medium">Sexe:</span>
                <p className="text-gray-600">{student.personne.sexe}</p>
              </div>
              <div>
                <span className="font-medium">Téléphone:</span>
                <p className="text-gray-600">{student.personne.telephone}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Adresse:</span>
                <p className="text-gray-600">{student.personne.adresse_quartier}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classe actuelle */}
      {student.classe_actuelle && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">📚 Classe actuelle</h4>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="font-medium">{student.classe_actuelle.nom}</p>
            <p className="text-sm text-gray-600">Niveau: {student.classe_actuelle.niveau}</p>
          </div>
        </div>
      )}

      {/* Parents */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">👥 Famille</h4>
        
        <div className="grid gap-4">
          {/* Père */}
          {student.pere && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {student.pere.personne.photo ? (
                    <img 
                      src={getPhotoUrl(student.pere.personne.photo) || ''} 
                      alt={`${student.pere.personne.prenom} ${student.pere.personne.nom}`}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-blue-600 font-semibold">👨</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    👨 Père: {student.pere.personne.prenom} {student.pere.personne.nom}
                  </p>
                  <p className="text-sm text-gray-600">📞 {student.pere.personne.telephone}</p>
                  {student.pere.profession && (
                    <p className="text-sm text-gray-600">💼 {student.pere.profession}</p>
                  )}
                  {student.pere.lieu_travail && (
                    <p className="text-sm text-gray-600">🏢 {student.pere.lieu_travail}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mère */}
          {student.mere && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                  {student.mere.personne.photo ? (
                    <img 
                      src={getPhotoUrl(student.mere.personne.photo) || ''} 
                      alt={`${student.mere.personne.prenom} ${student.mere.personne.nom}`}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-pink-600 font-semibold">👩</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    👩 Mère: {student.mere.personne.prenom} {student.mere.personne.nom}
                  </p>
                  <p className="text-sm text-gray-600">📞 {student.mere.personne.telephone}</p>
                  {student.mere.profession && (
                    <p className="text-sm text-gray-600">💼 {student.mere.profession}</p>
                  )}
                  {student.mere.lieu_travail && (
                    <p className="text-sm text-gray-600">🏢 {student.mere.lieu_travail}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tuteur (obligatoire) */}
          {student.tuteur_details && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  {student.tuteur_details.personne.photo ? (
                    <img 
                      src={getPhotoUrl(student.tuteur_details.personne.photo) || ''} 
                      alt={`${student.tuteur_details.personne.prenom} ${student.tuteur_details.personne.nom}`}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-green-600 font-semibold">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    👤 Tuteur: {student.tuteur_details.personne.prenom} {student.tuteur_details.personne.nom}
                    {student.tuteur_role && (
                      <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                        {student.tuteur_role === 'pere' ? 'Le père' : 
                         student.tuteur_role === 'mere' ? 'La mère' : 'Autre personne'}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">📞 {student.tuteur_details.personne.telephone}</p>
                  {student.tuteur_details.profession && (
                    <p className="text-sm text-gray-600">💼 {student.tuteur_details.profession}</p>
                  )}
                  {student.tuteur_details.lieu_travail && (
                    <p className="text-sm text-gray-600">🏢 {student.tuteur_details.lieu_travail}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historique des inscriptions */}
      {student.inscriptions.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">📋 Historique des inscriptions</h4>
          <div className="space-y-2">
            {student.inscriptions.map((inscription) => (
              <div 
                key={inscription.id} 
                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{inscription.classe.nom}</p>
                  <p className="text-sm text-gray-600">
                    {inscription.annee_scolaire.nom}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inscription.statut === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {inscription.statut}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(inscription.date_inscription).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
