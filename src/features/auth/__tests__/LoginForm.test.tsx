import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, userEvent, waitFor } from '../../../test/test-utils';
import { LoginForm } from '../components/LoginForm';

// Mock du hook useLogin avec vi.hoisted pour éviter les problèmes de hoisting
const { mockMutateAsync, mockUseLogin } = vi.hoisted(() => {
  const mockMutateAsync = vi.fn();
  const mockUseLogin = vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  }));
  
  return { mockMutateAsync, mockUseLogin };
});

vi.mock('../api', () => ({
  useLogin: mockUseLogin,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait afficher le formulaire de connexion', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('devrait afficher les erreurs de validation', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    await user.click(submitButton);
    
    expect(await screen.findByText(/le nom d'utilisateur est requis/i)).toBeInTheDocument();
    expect(await screen.findByText(/le mot de passe est requis/i)).toBeInTheDocument();
  });

  it('devrait valider la longueur minimale', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await user.type(usernameInput, 'ab'); // Trop court
    await user.type(passwordInput, '123'); // Trop court
    await user.click(submitButton);
    
    expect(await screen.findByText(/le nom d'utilisateur doit contenir au moins 3 caractères/i)).toBeInTheDocument();
    expect(await screen.findByText(/le mot de passe doit contenir au moins 6 caractères/i)).toBeInTheDocument();
  });

  it('devrait soumettre le formulaire avec des données valides', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockMutateAsync.mockResolvedValue({});
    
    render(<LoginForm onSuccess={onSuccess} />);
    
    const usernameInput = screen.getByLabelText(/nom d'utilisateur/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
    
    expect(onSuccess).toHaveBeenCalled();
  });

  it('devrait basculer la visibilité du mot de passe', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Le bouton de toggle
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('devrait afficher un état de chargement', () => {
    mockUseLogin.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      error: null,
    });
    
    render(<LoginForm />);
    
    expect(screen.getByText('Connexion...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connexion/i })).toBeDisabled();
  });

  it('devrait afficher le contenu descriptif sur desktop', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('École Management')).toBeInTheDocument();
    expect(screen.getByText('Système de Gestion Scolaire')).toBeInTheDocument();
    expect(screen.getByText('Gestion des élèves')).toBeInTheDocument();
    expect(screen.getByText('Équipe pédagogique')).toBeInTheDocument();
  });
});