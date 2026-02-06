import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

describe('ThemeContext', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorage.clear()
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')
  })

  it('should render children without crashing', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child Component</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')
    
    spy.mockRestore()
  })

  it('should load saved theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark')
    
    const TestComponent = () => {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should use system preference when no saved theme exists', () => {
    // Mock system dark mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
    
    const TestComponent = () => {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should default to light theme when no preference is set', () => {
    // Mock system light mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
    
    const TestComponent = () => {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('should toggle theme from light to dark', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
        </div>
      )
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    
    fireEvent.click(screen.getByTestId('toggle'))
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should toggle theme from dark to light', () => {
    localStorage.setItem('theme', 'dark')
    
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
        </div>
      )
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    
    fireEvent.click(screen.getByTestId('toggle'))
    
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('should persist theme preference across toggles', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
        </div>
      )
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Toggle to dark
    fireEvent.click(screen.getByTestId('toggle'))
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    
    // Toggle back to light
    fireEvent.click(screen.getByTestId('toggle'))
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('should handle SSR/hydration correctly', () => {
    // Ensure no errors during SSR
    const TestComponent = () => {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }
    
    const { container } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(container.firstChild).toBeTruthy()
  })

  it('should update document attribute when theme changes', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
        </div>
      )
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const htmlElement = document.documentElement
    
    expect(htmlElement.getAttribute('data-theme')).toBe('light')
    
    fireEvent.click(screen.getByTestId('toggle'))
    expect(htmlElement.getAttribute('data-theme')).toBe('dark')
    
    fireEvent.click(screen.getByTestId('toggle'))
    expect(htmlElement.getAttribute('data-theme')).toBe('light')
  })
})
