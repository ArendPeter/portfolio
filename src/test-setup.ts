import '@testing-library/jest-dom'

// jsdom doesn't implement matchMedia; stub it as hover-capable desktop by default.
// Tests that need a touch device override via vi.stubGlobal('matchMedia', ...).
// Guard: this file is also loaded by Node-environment tests where window is absent.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): Partial<MediaQueryList> => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}
