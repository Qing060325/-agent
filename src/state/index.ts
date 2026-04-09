export { AppStateStore, globalAppStateStore } from './AppStateStore.js';
export { SessionManager, globalSessionManager } from './SessionManager.js';
export { AutoMemory, globalAutoMemory } from './AutoMemory.js';

/**
 * Initialize all state management systems
 */
export async function initializeStateManagement(): Promise<void> {
  const { globalSessionManager } = await import('./SessionManager.js');
  const { globalAutoMemory } = await import('./AutoMemory.js');

  // Initialize session manager
  await globalSessionManager.initialize();

  // Initialize auto memory
  await globalAutoMemory.initialize();

  console.log('[state] State management systems initialized');
}
