import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../api';
import type { TLoginRequest } from '../types';

// Schema de validation Zod - Aligné avec OAuth2PasswordRequestForm
const loginSchema = z.object({
  username: z.string()
    .min(1, 'Le nom d\'utilisateur est requis')
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: TLoginRequest) => {
    try {
      await loginMutation.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      // Logs détaillés pour le debugging
      console.error('❌ [LOGIN] Erreur de connexion:', error);
      
      // Gestion d'erreur typée pour Axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
        console.error('📊 [LOGIN] Status:', axiosError.response?.status);
        console.error('📄 [LOGIN] Message:', axiosError.response?.data?.detail);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Section gauche - Texte descriptif */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-indigo-600 to-blue-700 items-center justify-center p-12">
          <div className="max-w-md text-white">
            <div className="flex items-center mb-8">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
                <span className="text-3xl">🎓</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">École Management</h1>
                <p className="text-indigo-200">Système de Gestion Scolaire</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">Bienvenue dans votre espace</h2>
                <p className="text-indigo-100 leading-relaxed">
                  Accédez à tous les outils nécessaires pour gérer efficacement votre établissement scolaire. 
                  Suivez les élèves, organisez les classes et communiquez avec les équipes pédagogiques.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mt-0.5">
                    <span className="text-sm">📚</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Gestion des élèves</h3>
                    <p className="text-sm text-indigo-200">Inscriptions, notes, absences et suivi personnalisé</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mt-0.5">
                    <span className="text-sm">👥</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Équipe pédagogique</h3>
                    <p className="text-sm text-indigo-200">Coordination des enseignants et du personnel</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mt-0.5">
                    <span className="text-sm">📊</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Rapports & Statistiques</h3>
                    <p className="text-sm text-indigo-200">Tableaux de bord et analyses détaillées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire de connexion */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Header mobile/tablet */}
            <div className="lg:hidden text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
                <span className="text-2xl">🎓</span>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">École Management</h2>
              <p className="mt-2 text-sm text-gray-600">Connexion à votre espace</p>
            </div>
            
            {/* Header desktop */}
            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
              <p className="mt-2 text-sm text-gray-600">
                Saisissez vos identifiants pour accéder à votre espace
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nom d'utilisateur
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Nom d'utilisateur"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`appearance-none relative block w-full px-3 py-3 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10`}
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="text-gray-400 text-sm">
                        {showPassword ? '🙈' : '👁️'}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {loginMutation.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">
                    ⚠️ Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Assurez-vous que votre compte est activé dans le système.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Connexion...
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                École Management System v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
