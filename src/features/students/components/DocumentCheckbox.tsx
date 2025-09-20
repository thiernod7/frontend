import React from 'react';
import type { TTypeDocument } from '../../documents/types';

interface DocumentCheckboxProps {
  document: TTypeDocument;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const DocumentCheckbox: React.FC<DocumentCheckboxProps> = ({
  document,
  checked,
  onChange
}) => {
  return (
    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <input
        type="checkbox"
        id={`doc-${document.id}`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
      />
      <div className="flex-1">
        <label 
          htmlFor={`doc-${document.id}`}
          className="text-sm font-medium text-gray-900 cursor-pointer flex items-center"
        >
          {document.nom}
          {document.est_obligatoire && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Obligatoire
            </span>
          )}
          {!document.est_obligatoire && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Optionnel
            </span>
          )}
        </label>
        {document.description && (
          <p className="mt-1 text-xs text-gray-500">{document.description}</p>
        )}
      </div>
    </div>
  );
};