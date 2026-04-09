import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { z } from 'zod';

/**
 * Config Validator - Validate configuration files and provide fix suggestions
 */

const ManusConfigSchema = z.object({
  model: z.string().optional().default('claude-3-5-sonnet'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().positive().optional().default(100000),
  theme: z.enum(['light', 'dark', 'auto']).optional().default('dark'),
  language: z.string().optional().default('en'),
  timezone: z.string().optional(),
  telemetry: z.boolean().optional().default(false),
  sandbox: z.boolean().optional().default(true),
  autoComplete: z.boolean().optional().default(true),
  streaming: z.boolean().optional().default(true),
  localModel: z
    .object({
      enabled: z.boolean().optional().default(false),
      baseUrl: z.string().url().optional().default('http://localhost:11434'),
      defaultModel: z.string().optional().default('llama3'),
    })
    .optional(),
  mcp: z
    .array(
      z.object({
        name: z.string(),
        command: z.string(),
        args: z.array(z.string()).optional(),
        env: z.record(z.string()).optional(),
      })
    )
    .optional()
    .default([]),
  plugins: z.array(z.string()).optional().default([]),
  keybindings: z.record(z.string()).optional().default({}),
});

export type ManusConfig = z.infer<typeof ManusConfigSchema>;

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  config?: ManusConfig;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  fix?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: any;
}

export class ConfigValidator {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath =
      configPath || path.join(os.homedir(), '.manus', 'config.json');
  }

  /**
   * Validate config file
   */
  validate(filePath?: string): ValidationResult {
    const targetPath = filePath || this.configPath;
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Check if file exists
    if (!fs.existsSync(targetPath)) {
      return {
        valid: false,
        errors: [
          {
            field: 'file',
            message: `Config file not found: ${targetPath}`,
            fix: `Run 'manus config init' to create a default config`,
          },
        ],
        warnings: [],
        suggestions: ['Run: manus config init'],
      };
    }

    // Parse JSON
    let rawConfig: any;
    try {
      const content = fs.readFileSync(targetPath, 'utf-8');
      rawConfig = JSON.parse(content);
    } catch (parseError: any) {
      return {
        valid: false,
        errors: [
          {
            field: 'json',
            message: `Invalid JSON: ${parseError.message}`,
            fix: 'Fix JSON syntax errors in the config file',
          },
        ],
        warnings: [],
        suggestions: ['Validate JSON syntax with: node -e "JSON.parse(require(\'fs\').readFileSync(\'config.json\',\'utf-8\'))"'],
      };
    }

    // Validate against schema
    const result = ManusConfigSchema.safeParse(rawConfig);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message,
          value: rawConfig[issue.path[0]],
          fix: this.suggestFix(issue),
        });
      }
    }

    // Additional semantic checks
    this.checkSemantics(rawConfig, warnings, suggestions);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      config: result.success ? result.data : undefined,
    };
  }

  /**
   * Validate a config object directly
   */
  validateConfig(config: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    const result = ManusConfigSchema.safeParse(config);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          field: issue.path.join('.'),
          message: issue.message,
          value: config[issue.path[0]],
          fix: this.suggestFix(issue),
        });
      }
    }

    this.checkSemantics(config, warnings, suggestions);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      config: result.success ? result.data : undefined,
    };
  }

  /**
   * Generate default config
   */
  generateDefault(): ManusConfig {
    return ManusConfigSchema.parse({});
  }

  /**
   * Initialize config file with defaults
   */
  initConfig(): string {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const defaultConfig = this.generateDefault();
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(defaultConfig, null, 2),
      'utf-8'
    );

    return this.configPath;
  }

  /**
   * Merge partial config with defaults
   */
  mergeWithDefaults(partial: Partial<ManusConfig>): ManusConfig {
    return ManusConfigSchema.parse(partial);
  }

  /**
   * Suggest fix for validation issue
   */
  private suggestFix(issue: z.ZodIssue): string {
    switch (issue.code) {
      case 'invalid_type':
        if (issue.expected === 'number') {
          return `Change "${issue.path.join('.')}" to a number`;
        }
        if (issue.expected === 'boolean') {
          return `Change "${issue.path.join('.')}" to true or false`;
        }
        if (issue.expected === 'string') {
          return `Change "${issue.path.join('.')}" to a string`;
        }
        return `Expected ${issue.expected}, got ${issue.received}`;

      case 'too_small':
        if (issue.type === 'number') {
          return `${issue.path.join('.')} must be >= ${issue.minimum}`;
        }
        return `Value too small`;

      case 'too_big':
        if (issue.type === 'number') {
          return `${issue.path.join('.')} must be <= ${issue.maximum}`;
        }
        return `Value too large`;

      case 'invalid_value':
        return `Valid values: ${issue.options?.join(', ')}`;

      case 'invalid_string':
        if (issue.validation === 'url') {
          return `${issue.path.join('.')} must be a valid URL (e.g., http://localhost:11434)`;
        }
        return `Invalid string format`;

      default:
        return `Check the value of ${issue.path.join('.')}`;
    }
  }

  /**
   * Semantic checks
   */
  private checkSemantics(
    config: any,
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Temperature check
    if (config.temperature !== undefined && config.temperature > 1.5) {
      warnings.push({
        field: 'temperature',
        message: 'High temperature (>1.5) may produce incoherent results',
        value: config.temperature,
      });
      suggestions.push('Consider using temperature between 0.3 and 1.0');
    }

    // Max tokens check
    if (config.maxTokens !== undefined && config.maxTokens > 200000) {
      warnings.push({
        field: 'maxTokens',
        message: 'Very high maxTokens may increase costs significantly',
        value: config.maxTokens,
      });
    }

    // Local model check
    if (config.localModel?.enabled && !config.localModel?.baseUrl) {
      warnings.push({
        field: 'localModel.baseUrl',
        message: 'Local model enabled but no baseUrl specified, using default',
      });
    }

    // MCP servers check
    if (config.mcp && config.mcp.length > 5) {
      warnings.push({
        field: 'mcp',
        message: 'Many MCP servers configured, may slow down startup',
        value: config.mcp.length,
      });
      suggestions.push('Consider removing unused MCP servers');
    }

    // Telemetry warning
    if (config.telemetry === true) {
      warnings.push({
        field: 'telemetry',
        message: 'Telemetry is enabled - anonymous usage data is collected',
      });
    }
  }

  /**
   * Print validation result in human-readable format
   */
  formatResult(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.valid) {
      lines.push('✅ Configuration is valid');
    } else {
      lines.push('❌ Configuration has errors');
    }

    if (result.errors.length > 0) {
      lines.push('');
      lines.push('Errors:');
      for (const err of result.errors) {
        lines.push(`  ❌ ${err.field}: ${err.message}`);
        if (err.fix) {
          lines.push(`     💡 Fix: ${err.fix}`);
        }
      }
    }

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('Warnings:');
      for (const warn of result.warnings) {
        lines.push(`  ⚠️ ${warn.field}: ${warn.message}`);
      }
    }

    if (result.suggestions.length > 0) {
      lines.push('');
      lines.push('Suggestions:');
      for (const sug of result.suggestions) {
        lines.push(`  💡 ${sug}`);
      }
    }

    return lines.join('\n');
  }
}

export const globalConfigValidator = new ConfigValidator();
