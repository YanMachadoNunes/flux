import '@testing-library/jest-dom'

// Mock localStorage with actual storage
let localStorageData: { [key: string]: string } = {}

const localStorageMock = {
  getItem: jest.fn((key: string) => localStorageData[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageData[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageData[key]
  }),
  clear: jest.fn(() => {
    localStorageData = {}
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Reset mocks and storage before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageData = {}
  document.documentElement.removeAttribute('data-theme')
})
