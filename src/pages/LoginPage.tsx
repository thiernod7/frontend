import { LoginForm } from '../features/auth/components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from '../features/auth/api';
import { logger } from '../shared/utils/logger';

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    logger.feature('auth', 'Page de connexion affichée');
    
    // Rediriger si déjà connecté
    if (isAuthenticated()) {
      logger.navigation('/login', '/dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    logger.navigation('/login', '/dashboard');
    navigate('/dashboard');
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
}
