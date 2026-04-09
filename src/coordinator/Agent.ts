import type { Agent as IAgent, AgentConfig, AgentContext, AgentState } from '../types/index.js';

/**
 * Agent implementation
 */
export class Agent implements IAgent {
  id: string;
  role: string;
  capabilities: string[];
  state: AgentState = 'idle';
  context: AgentContext;

  constructor(config: AgentConfig) {
    this.id = config.id || generateId();
    this.role = config.role;
    this.capabilities = config.capabilities;
    this.context = config.context || {};
  }

  /**
   * Execute a task
   */
  async execute(task: string): Promise<any> {
    try {
      this.state = 'processing';

      // Simulate task execution
      const result = await this.executeTask(task);

      this.state = 'completed';
      return result;
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
  }

  /**
   * Execute with sub-agents
   */
  async executeWithSubAgents(goal: string, subAgents: Agent[]): Promise<any> {
    try {
      this.state = 'processing';

      // Coordinate sub-agents
      const results = await Promise.all(
        subAgents.map((agent) => agent.execute(goal))
      );

      this.state = 'completed';
      return {
        goal,
        results,
        coordinator: this.id,
      };
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
  }

  /**
   * Execute task implementation
   */
  private async executeTask(task: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          agent: this.id,
          role: this.role,
          task,
          result: `Task completed by ${this.role}`,
          timestamp: Date.now(),
        });
      }, 100);
    });
  }

  /**
   * Get agent info
   */
  getInfo() {
    return {
      id: this.id,
      role: this.role,
      capabilities: this.capabilities,
      state: this.state,
      context: this.context,
    };
  }
}

/**
 * Agent Pool - Manages multiple agents
 */
export class AgentPool {
  private agents: Map<string, Agent> = new Map();

  /**
   * Spawn a new agent
   */
  async spawn(config: AgentConfig): Promise<Agent> {
    const agent = new Agent(config);
    this.agents.set(agent.id, agent);
    return agent;
  }

  /**
   * Get agent by ID
   */
  get(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List all agents
   */
  list(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Remove agent
   */
  remove(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /**
   * Get agents by role
   */
  getByRole(role: string): Agent[] {
    return this.list().filter((agent) => agent.role === role);
  }

  /**
   * Get agents by capability
   */
  getByCapability(capability: string): Agent[] {
    return this.list().filter((agent) =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const agents = this.list();
    return {
      totalAgents: agents.length,
      byState: {
        idle: agents.filter((a) => a.state === 'idle').length,
        processing: agents.filter((a) => a.state === 'processing').length,
        completed: agents.filter((a) => a.state === 'completed').length,
        failed: agents.filter((a) => a.state === 'failed').length,
      },
      agents: agents.map((a) => a.getInfo()),
    };
  }

  /**
   * Clear all agents
   */
  clear(): void {
    this.agents.clear();
  }
}

/**
 * Multi-Agent Coordinator
 */
export class MultiAgentCoordinator {
  private pool: AgentPool;

  constructor(pool: AgentPool) {
    this.pool = pool;
  }

  /**
   * Run sequential execution
   */
  async runSequential(goal: string, agentIds: string[]): Promise<any[]> {
    const results = [];
    for (const agentId of agentIds) {
      const agent = this.pool.get(agentId);
      if (agent) {
        const result = await agent.execute(goal);
        results.push(result);
      }
    }
    return results;
  }

  /**
   * Run parallel execution
   */
  async runParallel(goal: string, agentIds: string[]): Promise<any[]> {
    const agents = agentIds
      .map((id) => this.pool.get(id))
      .filter((a) => a !== undefined) as Agent[];

    return Promise.all(agents.map((agent) => agent.execute(goal)));
  }

  /**
   * Run hierarchical execution
   */
  async runHierarchical(goal: string, coordinatorId: string): Promise<any> {
    const coordinator = this.pool.get(coordinatorId);
    if (!coordinator) {
      throw new Error(`Coordinator ${coordinatorId} not found`);
    }

    const subAgents = this.pool.list().filter((a) => a.id !== coordinatorId);
    return coordinator.executeWithSubAgents(goal, subAgents);
  }

  /**
   * Get coordinator statistics
   */
  getStats() {
    return this.pool.getStats();
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Global agent pool instance
 */
export const globalAgentPool = new AgentPool();

/**
 * Global coordinator instance
 */
export const globalCoordinator = new MultiAgentCoordinator(globalAgentPool);
