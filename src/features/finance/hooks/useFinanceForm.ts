import { useState, useCallback } from 'react';
import type { TFinanceFormErrors } from '../types';
import { hasErrors, clearError } from '../utils/validation';

interface UseFormValidationOptions<T> {
  initialData: T;
  validators: { [K in keyof T]?: (value: T[K]) => string | null };
  onSubmit: (data: T) => Promise<void> | void;
}

interface UseFormValidationReturn<T> {
  data: T;
  errors: TFinanceFormErrors;
  isSubmitting: boolean;
  hasValidationErrors: boolean;
  updateField: (field: keyof T, value: T[keyof T]) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setErrors: (errors: TFinanceFormErrors) => void;
}

/**
 * Hook personnalisé pour la gestion des formulaires avec validation
 */
export function useFormValidation<T extends Record<string, unknown>>({
  initialData,
  validators,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<TFinanceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasValidationErrors = hasErrors(errors);

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field as string]) {
      setErrors(prev => clearError(prev, field as string));
    }
  }, [errors]);

  const validateField = useCallback((field: keyof T): boolean => {
    const validator = validators[field];
    if (!validator) return true;

    const error = validator(data[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field as string]: error }));
      return false;
    } else {
      setErrors(prev => clearError(prev, field as string));
      return true;
    }
  }, [data, validators]);

  const validateAll = useCallback((): boolean => {
    const newErrors: TFinanceFormErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(field => {
      const validator = validators[field as keyof T];
      if (validator) {
        const error = validator(data[field as keyof T]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, validators]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // L'erreur est gérée par le composant parent
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validateAll, onSubmit]);

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    data,
    errors,
    isSubmitting,
    hasValidationErrors,
    updateField,
    validateField,
    validateAll,
    handleSubmit,
    resetForm,
    setErrors,
  };
}

/**
 * Hook pour la gestion des modales
 */
interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

/**
 * Hook pour la gestion des listes avec recherche et filtrage
 */
interface UseListManagementOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  initialSearchTerm?: string;
}

interface UseListManagementReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: T[];
  hasResults: boolean;
}

export function useListManagement<T extends Record<string, unknown>>({
  items,
  searchFields,
  initialSearchTerm = '',
}: UseListManagementOptions<T>): UseListManagementReturn<T> {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const filteredItems = items.filter(item => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      return false;
    });
  });

  const hasResults = filteredItems.length > 0;

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    hasResults,
  };
}

/**
 * Hook pour la gestion des actions CRUD avec confirmations
 */
interface UseCrudActionsOptions<T> {
  onEdit: (item: T) => void;
  onDelete: (item: T) => Promise<void>;
  onView?: (item: T) => void;
}

interface UseCrudActionsReturn<T> {
  selectedItem: T | null;
  isDeleting: boolean;
  showDeleteConfirm: boolean;
  handleEdit: (item: T) => void;
  handleDelete: (item: T) => void;
  handleView: (item: T) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

export function useCrudActions<T>({
  onEdit,
  onDelete,
  onView,
}: UseCrudActionsOptions<T>): UseCrudActionsReturn<T> {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = useCallback((item: T) => {
    onEdit(item);
  }, [onEdit]);

  const handleDelete = useCallback((item: T) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  }, []);

  const handleView = useCallback((item: T) => {
    if (onView) {
      onView(item);
    }
  }, [onView]);

  const confirmDelete = useCallback(async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await onDelete(selectedItem);
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItem, onDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    isDeleting,
    showDeleteConfirm,
    handleEdit,
    handleDelete,
    handleView,
    confirmDelete,
    cancelDelete,
  };
}

/**
 * Hook pour la gestion des états de chargement et d'erreur
 */
interface UseAsyncStateOptions {
  initialLoading?: boolean;
}

interface UseAsyncStateReturn {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  executeAsync: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
}

export function useAsyncState({ 
  initialLoading = false 
}: UseAsyncStateOptions = {}): UseAsyncStateReturn {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); // Effacer l'erreur lors d'un nouveau chargement
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
    executeAsync,
  };
}