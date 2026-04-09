import type { AppState, Session, User, UserPreferences, LayoutConfig } from '../types/index.js';

/**
 * Application state store (Zustand-like implementation)
 */
export class AppStateStore {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor(initialState: Partial<AppState> = {}) {
    this.state = {
      currentSessionId: '',
      sessions: new Map(),
      theme: 'dark',
      layout: {},
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: true,
      },
      isProcessing: false,
      memoryContent: '',
      ...initialState,
    };
  }

  /**
   * Update state
   */
  setState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState(): AppState {
    return this.state;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current session
   */
  getCurrentSession(): Session | undefined {
    if (!this.state.currentSessionId) return undefined;
    return this.state.sessions.get(this.state.currentSessionId);
  }

  /**
   * Set current session
   */
  setCurrentSession(sessionId: string): void {
    this.setState({ currentSessionId: sessionId });
  }

  /**
   * Add session
   */
  addSession(session: Session): void {
    const sessions = new Map(this.state.sessions);
    sessions.set(session.id, session);
    this.setState({ sessions });
  }

  /**
   * Remove session
   */
  removeSession(sessionId: string): void {
    const sessions = new Map(this.state.sessions);
    sessions.delete(sessionId);
    this.setState({ sessions });
  }

  /**
   * Get all sessions
   */
  getSessions(): Session[] {
    return Array.from(this.state.sessions.values());
  }

  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.setState({
      theme,
      preferences: { ...this.state.preferences, theme },
    });
  }

  /**
   * Set layout
   */
  setLayout(layout: LayoutConfig): void {
    this.setState({ layout });
  }

  /**
   * Set processing state
   */
  setProcessing(isProcessing: boolean): void {
    this.setState({ isProcessing });
  }

  /**
   * Update memory content
   */
  setMemoryContent(content: string): void {
    this.setState({ memoryContent: content });
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.state = {
      currentSessionId: '',
      sessions: new Map(),
      theme: 'dark',
      layout: {},
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: true,
      },
      isProcessing: false,
      memoryContent: '',
    };
    this.notifyListeners();
  }

  /**
   * Export state to JSON
   */
  toJSON(): any {
    return {
      currentSessionId: this.state.currentSessionId,
      sessions: Array.from(this.state.sessions.entries()),
      theme: this.state.theme,
      layout: this.state.layout,
      preferences: this.state.preferences,
      isProcessing: this.state.isProcessing,
      memoryContent: this.state.memoryContent,
    };
  }

  /**
   * Import state from JSON
   */
  fromJSON(data: any): void {
    const sessions = new Map(data.sessions || []);
    this.state = {
      currentSessionId: data.currentSessionId || '',
      sessions,
      theme: data.theme || 'dark',
      layout: data.layout || {},
      preferences: data.preferences || {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        notifications: true,
      },
      isProcessing: data.isProcessing || false,
      memoryContent: data.memoryContent || '',
    };
    this.notifyListeners();
  }
}

/**
 * Global app state store instance
 */
export const globalAppStateStore = new AppStateStore();
