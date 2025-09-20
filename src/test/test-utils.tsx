import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock du QueryClient pour les tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper personnalisé avec tous les providers nécessaires
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

function customRender(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper pour créer des données de test
export const createMockStudent = (overrides = {}) => ({
  id: '1',
  numero_matricule: 'STU001',
  date_naissance: '2010-01-01',
  lieu_naissance: 'Dakar',
  classe_actuelle: {
    id: '1',
    nom: 'CM2 A',
    niveau: 'CM2',
  },
  personne: {
    id: '1',
    nom: 'Diallo',
    prenom: 'Amadou',
    sexe: 'M',
    telephone: '771234567',
    adresse_quartier: 'Parcelles Assainies',
    photo: undefined,
    type: 'eleve',
  },
  ...overrides,
});

export const createMockSearchParams = (overrides = {}) => ({
  search: '',
  ...overrides,
});

// Re-export des fonctions de test essentielles
export { screen, fireEvent, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
export { createTestQueryClient };