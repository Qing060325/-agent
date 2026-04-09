import type { Permission, ToolContext } from '../types/index.js';

/**
 * Permission types
 */
export enum PermissionType {
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  EXECUTE_COMMAND = 'execute_command',
  NETWORK_ACCESS = 'network_access',
  AGENT_SPAWN = 'agent_spawn',
  MCP_ACCESS = 'mcp_access',
}

/**
 * File access permission
 */
export class FileAccessPermission implements Permission {
  name = 'file_access';
  private allowedPaths: string[] = [];
  private deniedPaths: string[] = [];

  constructor(allowedPaths: string[] = [], deniedPaths: string[] = []) {
    this.allowedPaths = allowedPaths;
    this.deniedPaths = deniedPaths;
  }

  check(context: ToolContext): boolean {
    // If no restrictions, allow
    if (this.allowedPaths.length === 0 && this.deniedPaths.length === 0) {
      return true;
    }

    // Check denied paths
    for (const denied of this.deniedPaths) {
      if (context.hasFileAccess?.(denied) === false) {
        return false;
      }
    }

    // Check allowed paths
    if (this.allowedPaths.length > 0) {
      for (const allowed of this.allowedPaths) {
        if (context.hasFileAccess?.(allowed) === true) {
          return true;
        }
      }
      return false;
    }

    return true;
  }
}

/**
 * Network access permission
 */
export class NetworkAccessPermission implements Permission {
  name = 'network_access';
  private allowedDomains: string[] = [];

  constructor(allowedDomains: string[] = []) {
    this.allowedDomains = allowedDomains;
  }

  check(context: ToolContext): boolean {
    // If no restrictions, allow
    if (this.allowedDomains.length === 0) {
      return true;
    }

    // In production, check actual URL against allowed domains
    return true;
  }
}

/**
 * Agent spawn permission
 */
export class AgentSpawnPermission implements Permission {
  name = 'agent_spawn';
  private maxAgents: number;
  private allowedRoles: string[];

  constructor(maxAgents: number = 10, allowedRoles: string[] = []) {
    this.maxAgents = maxAgents;
    this.allowedRoles = allowedRoles;
  }

  check(context: ToolContext): boolean {
    // Check if user can spawn agents
    if (context.user?.role !== 'admin' && this.allowedRoles.length > 0) {
      return false;
    }

    // Check agent count limit
    if (context.agentPool) {
      const agentCount = context.agentPool.list().length;
      if (agentCount >= this.maxAgents) {
        return false;
      }
    }

    return true;
  }
}

/**
 * MCP access permission
 */
export class MCPAccessPermission implements Permission {
  name = 'mcp_access';
  private allowedServers: string[];

  constructor(allowedServers: string[] = []) {
    this.allowedServers = allowedServers;
  }

  check(context: ToolContext): boolean {
    // If no restrictions, allow
    if (this.allowedServers.length === 0) {
      return true;
    }

    // In production, check against allowed servers
    return true;
  }
}

/**
 * Permission manager
 */
export class PermissionManager {
  private permissions: Map<string, Permission> = new Map();

  /**
   * Register permission
   */
  register(permission: Permission): void {
    this.permissions.set(permission.name, permission);
  }

  /**
   * Check permission
   */
  check(permissionName: string, context: ToolContext): boolean {
    const permission = this.permissions.get(permissionName);
    if (!permission) {
      return true; // Allow if permission not defined
    }

    return permission.check(context);
  }

  /**
   * Check multiple permissions
   */
  checkAll(permissionNames: string[], context: ToolContext): boolean {
    return permissionNames.every((name) => this.check(name, context));
  }

  /**
   * Get all permissions
   */
  getAll(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Clear permissions
   */
  clear(): void {
    this.permissions.clear();
  }
}

/**
 * Global permission manager instance
 */
export const globalPermissionManager = new PermissionManager();

/**
 * Initialize default permissions
 */
export function initializeDefaultPermissions(): void {
  globalPermissionManager.register(new FileAccessPermission());
  globalPermissionManager.register(new NetworkAccessPermission());
  globalPermissionManager.register(new AgentSpawnPermission());
  globalPermissionManager.register(new MCPAccessPermission());
}
