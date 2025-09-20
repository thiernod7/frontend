import React from 'react';
import { formatMontant, getStatutVersementClass, getStatutVersementLabel } from '../utils/validation';
import type { TStatutVersement, TModePaiement } from '../types';
import { LABELS_MODES_PAIEMENT } from '../types';

// === COMPOSANT MONTANT ===
interface MontantProps {
  montant: number;
  showCurrency?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Montant({ montant, showCurrency = true, className = '', size = 'md' }: MontantProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-medium'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {formatMontant(montant, { showCurrency })}
    </span>
  );
}

// === COMPOSANT STATUT VERSEMENT ===
interface StatutVersementBadgeProps {
  statut: TStatutVersement;
  className?: string;
}

export function StatutVersementBadge({ statut, className = '' }: StatutVersementBadgeProps) {
  return (
    <span className={`${getStatutVersementClass(statut)} ${className}`}>
      {getStatutVersementLabel(statut)}
    </span>
  );
}

// === COMPOSANT MODE DE PAIEMENT ===
interface ModePaiementDisplayProps {
  mode: TModePaiement;
  className?: string;
}

export function ModePaiementDisplay({ mode, className = '' }: ModePaiementDisplayProps) {
  const getIcon = (mode: TModePaiement): string => {
    switch (mode) {
      case 'especes': return '💵';
      case 'cheque': return '📝';
      case 'virement': return '🏦';
      case 'carte_bancaire': return '💳';
      case 'mobile_money': return '📱';
      default: return '💰';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{getIcon(mode)}</span>
      <span>{LABELS_MODES_PAIEMENT[mode]}</span>
    </span>
  );
}

// === COMPOSANT BARRE DE PROGRESSION PAIEMENT ===
interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
}

export function PaymentProgressBar({ current, total, className = '', showPercentage = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const isComplete = percentage >= 100;
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progression du paiement</span>
        {showPercentage && (
          <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : percentage > 50 ? 'bg-blue-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Versé: <Montant montant={current} size="sm" /></span>
        <span>Total: <Montant montant={total} size="sm" /></span>
      </div>
    </div>
  );
}

// === COMPOSANT SITUATION FINANCIÈRE RÉSUMÉ ===
interface SituationResumeProps {
  totalAPayer: number;
  totalVerse: number;
  className?: string;
}

export function SituationResume({ totalAPayer, totalVerse, className = '' }: SituationResumeProps) {
  const solde = Math.max(0, totalAPayer - totalVerse);
  const isUpToDate = solde === 0;
  const isOverpaid = totalVerse > totalAPayer;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Total à payer */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-sm font-medium text-blue-600">Total à payer</div>
        <div className="mt-2">
          <Montant montant={totalAPayer} size="lg" className="text-blue-900" />
        </div>
      </div>

      {/* Total versé */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="text-sm font-medium text-green-600">Total versé</div>
        <div className="mt-2">
          <Montant montant={totalVerse} size="lg" className="text-green-900" />
        </div>
      </div>

      {/* Solde */}
      <div className={`rounded-lg p-4 ${
        isUpToDate ? 'bg-green-50' : isOverpaid ? 'bg-orange-50' : 'bg-red-50'
      }`}>
        <div className={`text-sm font-medium ${
          isUpToDate ? 'text-green-600' : isOverpaid ? 'text-orange-600' : 'text-red-600'
        }`}>
          {isUpToDate ? 'À jour' : isOverpaid ? 'Surplus' : 'Solde restant'}
        </div>
        <div className="mt-2">
          <Montant 
            montant={isOverpaid ? totalVerse - totalAPayer : solde} 
            size="lg" 
            className={isUpToDate ? 'text-green-900' : isOverpaid ? 'text-orange-900' : 'text-red-900'}
          />
        </div>
      </div>
    </div>
  );
}

// === COMPOSANT CARTE FRAIS ===
interface FraisCardProps {
  nom: string;
  description?: string;
  montant: number;
  montantVerse?: number;
  className?: string;
  onClick?: () => void;
}

export function FraisCard({ 
  nom, 
  description, 
  montant, 
  montantVerse = 0, 
  className = '', 
  onClick 
}: FraisCardProps) {
  const solde = montant - montantVerse;
  const isPaid = solde <= 0;

  return (
    <div 
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{nom}</h4>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <StatutVersementBadge statut={isPaid ? 'valide' : 'en_attente'} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Montant:</span>
          <Montant montant={montant} size="sm" />
        </div>
        
        {montantVerse > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Versé:</span>
            <Montant montant={montantVerse} size="sm" className="text-green-600" />
          </div>
        )}
        
        {solde > 0 && (
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-900">Reste:</span>
            <Montant montant={solde} size="sm" className="text-red-600" />
          </div>
        )}
        
        {montantVerse > 0 && (
          <PaymentProgressBar 
            current={montantVerse} 
            total={montant} 
            showPercentage={false}
            className="mt-3"
          />
        )}
      </div>
    </div>
  );
}

// === COMPOSANT EMPTY STATE ===
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon = <div className="text-4xl">📋</div>, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}

// === COMPOSANT LOADING STATE ===
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Chargement...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// === COMPOSANT ERROR STATE ===
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = 'Erreur', 
  message, 
  onRetry, 
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-red-400 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}