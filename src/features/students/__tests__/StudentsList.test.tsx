import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, userEvent } from '../../../test/test-utils';
import { StudentsList } from '../components/StudentsList';
import { createMockStudent, createMockSearchParams } from '../../../test/test-utils';

// Mock du hook useStudents avec vi.hoisted
const { mockUseStudents } = vi.hoisted(() => {
  const mockUseStudents = vi.fn();
  return { mockUseStudents };
});

vi.mock('../api', () => ({
  useStudents: mockUseStudents,
}));

// Mock de la fonction getPhotoUrl
vi.mock('../../../shared/utils/photos', () => ({
  getPhotoUrl: vi.fn((photo) => photo ? `http://localhost/photos/${photo}` : null),
}));

describe('StudentsList', () => {
  const mockProps = {
    searchParams: createMockSearchParams(),
    onSearchChange: vi.fn(),
    selectedStudent: null,
    onStudentSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  it('devrait afficher la barre de recherche', () => {
    render(<StudentsList {...mockProps} />);
    
    expect(screen.getByPlaceholderText(/rechercher par nom/i)).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('devrait afficher un état de chargement', () => {
    mockUseStudents.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    
    render(<StudentsList {...mockProps} />);
    
    // Doit afficher 5 éléments skeleton
    const skeletons = screen.getAllByRole('generic').filter(el => 
      el.className.includes('animate-pulse')
    );
    expect(skeletons).toHaveLength(5);
  });

  it('devrait afficher un message d\'erreur', () => {
    mockUseStudents.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    
    render(<StudentsList {...mockProps} />);
    
    expect(screen.getByText(/erreur de chargement des élèves/i)).toBeInTheDocument();
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
  });

  it('devrait afficher la liste des élèves', () => {
    const students = [
      createMockStudent({ id: '1' }),
      createMockStudent({ 
        id: '2', 
        personne: { ...createMockStudent().personne, nom: 'Ba', prenom: 'Fatou', id: '2' },
        numero_matricule: 'STU002'
      }),
    ];
    
    mockUseStudents.mockReturnValue({
      data: students,
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...mockProps} />);
    
    expect(screen.getByText('Amadou Diallo')).toBeInTheDocument();
    expect(screen.getByText('Fatou Ba')).toBeInTheDocument();
    expect(screen.getByText('Matricule: STU001')).toBeInTheDocument();
    expect(screen.getByText('Matricule: STU002')).toBeInTheDocument();
  });

  it('devrait afficher un message quand aucun élève n\'est trouvé', () => {
    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...mockProps} />);
    
    expect(screen.getByText('Aucun élève enregistré')).toBeInTheDocument();
  });

  it('devrait afficher un message de recherche vide', () => {
    const propsWithSearch = {
      ...mockProps,
      searchParams: createMockSearchParams({ search: 'test' }),
    };
    
    mockUseStudents.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...propsWithSearch} />);
    
    expect(screen.getByText('Aucun élève trouvé pour "test"')).toBeInTheDocument();
  });

  it('devrait permettre de rechercher un élève', async () => {
    const user = userEvent.setup();
    render(<StudentsList {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText(/rechercher par nom/i);
    const searchButton = screen.getByText('🔍');
    
    await user.type(searchInput, 'Amadou');
    await user.click(searchButton);
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith({
      search: 'Amadou',
    });
  });

  it('devrait permettre de vider la recherche', async () => {
    const user = userEvent.setup();
    const propsWithSearch = {
      ...mockProps,
      searchParams: createMockSearchParams({ search: 'test' }),
    };
    
    render(<StudentsList {...propsWithSearch} />);
    
    const clearButton = screen.getByText('✕');
    await user.click(clearButton);
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith({
      search: undefined,
    });
  });

  it('devrait sélectionner un élève au clic', async () => {
    const user = userEvent.setup();
    const student = createMockStudent();
    
    mockUseStudents.mockReturnValue({
      data: [student],
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...mockProps} />);
    
    const studentCard = screen.getByText('Amadou Diallo').closest('div');
    await user.click(studentCard!);
    
    expect(mockProps.onStudentSelect).toHaveBeenCalledWith(student);
  });

  it('devrait mettre en surbrillance l\'élève sélectionné', () => {
    const student = createMockStudent();
    const propsWithSelection = {
      ...mockProps,
      selectedStudent: student,
    };
    
    mockUseStudents.mockReturnValue({
      data: [student],
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...propsWithSelection} />);
    
    const studentCard = screen.getByText('Amadou Diallo').closest('div');
    expect(studentCard).toHaveClass('border-indigo-500', 'bg-indigo-50');
  });

  it('devrait afficher le compteur d\'élèves', () => {
    const students = [createMockStudent({ id: '1' }), createMockStudent({ id: '2' })];
    
    mockUseStudents.mockReturnValue({
      data: students,
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...mockProps} />);
    
    expect(screen.getByText('2 élèves')).toBeInTheDocument();
  });

  it('devrait afficher les informations de la classe', () => {
    const student = createMockStudent({
      classe_actuelle: { id: '1', nom: 'CM2 A', niveau: 'CM2' }
    });
    
    mockUseStudents.mockReturnValue({
      data: [student],
      isLoading: false,
      isError: false,
    });
    
    render(<StudentsList {...mockProps} />);
    
    expect(screen.getByText('📚 CM2 A')).toBeInTheDocument();
  });
});