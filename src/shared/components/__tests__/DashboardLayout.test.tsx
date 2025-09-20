import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '../../../test/test-utils';
import { DashboardLayout } from '../Layout/DashboardLayout';

// Mock des composants enfants
vi.mock('../Layout/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>
}));

vi.mock('../Layout/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar Component</div>
}));

describe('DashboardLayout', () => {
  it('devrait rendre le layout avec header et sidebar', () => {
    render(
      <DashboardLayout>
        <div data-testid="main-content">Test Content</div>
      </DashboardLayout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('devrait avoir la structure CSS correcte', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50');
    
    const flexContainer = rootDiv.children[1] as HTMLElement;
    expect(flexContainer).toHaveClass('flex');
    
    const mainElement = flexContainer.children[1] as HTMLElement;
    expect(mainElement).toHaveClass('flex-1', 'lg:ml-64', 'pt-16');
  });

  it('devrait rendre le contenu dans la zone principale', () => {
    render(
      <DashboardLayout>
        <h1>Dashboard Content</h1>
        <p>This is the main content area</p>
      </DashboardLayout>
    );
    
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.getByText('This is the main content area')).toBeInTheDocument();
  });
});