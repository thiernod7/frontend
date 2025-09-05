import React, { useRef, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

interface PhotoUploadProps {
  label: string;
  currentPhoto?: File;
  onPhotoChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'circular' | 'inline'; // Nouvelle prop pour les variants
  size?: 'sm' | 'md' | 'lg'; // Taille de l'avatar
}

export function PhotoUpload({ 
  label, 
  currentPhoto, 
  onPhotoChange, 
  disabled = false, 
  className = '',
  variant = 'default',
  size = 'md'
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Gestion de l'URL de prévisualisation
  useEffect(() => {
    if (currentPhoto && currentPhoto instanceof File) {
      try {
        const url = URL.createObjectURL(currentPhoto);
        setPreviewUrl(url);
        
        logger.feature('PhotoUpload', 'URL preview créée', { 
          label, 
          fileName: currentPhoto.name,
          fileSize: currentPhoto.size,
          url: url.substring(0, 50) + '...'
        });

        // Nettoyage de l'URL lors du démontage
        return () => {
          URL.revokeObjectURL(url);
          logger.feature('PhotoUpload', 'URL preview nettoyée', { label });
        };
      } catch (error) {
        logger.feature('PhotoUpload', 'Erreur création URL preview', { 
          error: String(error), 
          fileName: currentPhoto.name 
        });
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [currentPhoto, label]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    logger.feature('PhotoUpload', 'Changement de fichier', {
      label,
      fileName: file?.name || 'Aucun',
      fileSize: file?.size || 0,
      fileType: file?.type || 'N/A',
      variant
    });
    
    onPhotoChange(file);
  };

  const handleRemovePhoto = () => {
    logger.feature('PhotoUpload', 'Suppression photo', { label, variant });
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    logger.feature('PhotoUpload', 'Clic upload', { label, variant });
    fileInputRef.current?.click();
  };

  // Tailles selon le variant
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  // Variant circulaire compact pour les formulaires
  if (variant === 'circular') {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <div className="relative group">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt={`Photo ${label}`}
                className={`${sizeClasses[size]} object-cover rounded-full border-2 border-gray-200 shadow-sm bg-white`}
                onLoad={() => logger.feature('PhotoUpload', 'Image chargée avec succès', { label, url: previewUrl })}
                onError={(e) => {
                  logger.feature('PhotoUpload', 'Erreur chargement image', { 
                    label, 
                    url: previewUrl,
                    error: e.currentTarget.src 
                  });
                }}
              />
              {/* Boutons d'action au-dessus de l'image */}
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  type="button"
                  onClick={handleClickUpload}
                  disabled={disabled}
                  className="p-1 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 disabled:opacity-50 text-xs"
                  title="Modifier la photo"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={disabled}
                  className="p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 disabled:opacity-50 text-xs"
                  title="Supprimer la photo"
                >
                  🗑️
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={disabled}
              className={`${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50 bg-gray-50 hover:bg-gray-100`}
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs font-medium text-gray-700">{label}</p>
          {!previewUrl && (
            <p className="text-xs text-gray-500">Cliquer pour ajouter</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Variant inline pour les grilles
  if (variant === 'inline') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        
        <div className="flex items-center space-x-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Photo ${label}`}
              className="w-12 h-12 object-cover rounded-full border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 border border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              {previewUrl ? 'Modifier' : 'Ajouter'}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={disabled}
                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Variant par défaut (original)
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
        {previewUrl ? (
          // Prévisualisation de l'image
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt={`Prévisualisation ${label}`}
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {currentPhoto?.name}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleClickUpload}
                  disabled={disabled}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={disabled}
                  className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Zone de drop/upload
          <div className="space-y-3">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <button
                type="button"
                onClick={handleClickUpload}
                disabled={disabled}
                className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:opacity-50"
              >
                Choisir une photo
              </button>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG jusqu'à 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
