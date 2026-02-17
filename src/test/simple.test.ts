// Simple tests without VS Code dependencies
import { IntentClassifier } from '../classifier';
import { MODEL_ROUTING, Intent } from '../models';

// Mock console to avoid noise during tests
const originalConsole = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsole;
});

describe('IntentClassifier - Simple Tests', () => {
  let classifier: IntentClassifier;

  beforeEach(() => {
    classifier = new IntentClassifier();
  });

  test('should classify simple queries correctly', () => {
    expect(classifier.classify('git status')).toBe('simple');
    expect(classifier.classify('help me')).toBe('simple');
    expect(classifier.classify('what is this')).toBe('simple');
    expect(classifier.classify('list files')).toBe('simple');
  });

  test('should classify code generation queries correctly', () => {
    expect(classifier.classify('create API endpoint')).toBe('code_gen');
    expect(classifier.classify('generate function')).toBe('code_gen');
    expect(classifier.classify('implement class')).toBe('code_gen');
    expect(classifier.classify('add new feature')).toBe('code_gen');
  });

  test('should classify debug queries correctly', () => {
    expect(classifier.classify('why is this failing')).toBe('debug');
    expect(classifier.classify('error occurred')).toBe('debug');
    expect(classifier.classify('not working')).toBe('debug');
    expect(classifier.classify('fix bug')).toBe('debug');
  });

  test('should classify architecture queries correctly', () => {
    expect(classifier.classify('design system')).toBe('architecture');
    expect(classifier.classify('plan architecture')).toBe('architecture');
    expect(classifier.classify('best practice approach')).toBe('architecture');
    expect(classifier.classify('organize code')).toBe('architecture');
  });

  test('should handle edge cases', () => {
    expect(classifier.classify('')).toBe('simple'); // Default fallback
    expect(classifier.classify('xyz')).toBe('simple'); // Unknown patterns
    expect(classifier.classify('random text')).toBe('simple');
  });

  test('should provide correct routing', () => {
    const simpleRouting = classifier.getRouting('simple');
    expect(simpleRouting.config.model).toBe(MODEL_ROUTING.simple.model);
    expect(simpleRouting.config.cost).toBe(0);

    const codeGenRouting = classifier.getRouting('code_gen');
    expect(codeGenRouting.config.model).toBe(MODEL_ROUTING.code_gen.model);
    expect(codeGenRouting.config.cost).toBe(0.25);

    const debugRouting = classifier.getRouting('debug');
    expect(debugRouting.config.model).toBe(MODEL_ROUTING.debug.model);
    expect(debugRouting.config.cost).toBe(0.28);

    const architectureRouting = classifier.getRouting('architecture');
    expect(architectureRouting.config.model).toBe(MODEL_ROUTING.architecture.model);
    expect(architectureRouting.config.cost).toBe(5.0);
  });
});

describe('Model Routing Configuration', () => {
  test('should have correct model configurations', () => {
    expect(MODEL_ROUTING.simple.model).toBe('xiaomi/mimo-v2-flash');
    expect(MODEL_ROUTING.simple.cost).toBe(0);
    expect(MODEL_ROUTING.simple.maxTokens).toBe(4096);

    expect(MODEL_ROUTING.code_gen.model).toBe('deepseek/deepseek-coder-v3');
    expect(MODEL_ROUTING.code_gen.cost).toBe(0.25);
    expect(MODEL_ROUTING.code_gen.maxTokens).toBe(8192);

    expect(MODEL_ROUTING.debug.model).toBe('minimax/minimax-m2.1');
    expect(MODEL_ROUTING.debug.cost).toBe(0.28);
    expect(MODEL_ROUTING.debug.maxTokens).toBe(8192);

    expect(MODEL_ROUTING.architecture.model).toBe('anthropic/claude-opus-4-6');
    expect(MODEL_ROUTING.architecture.cost).toBe(5.0);
    expect(MODEL_ROUTING.architecture.maxTokens).toBe(16384);
  });

  test('should calculate potential savings', () => {
    const allOpusCost = 10 * 5.0; // 10 queries at $5 each = $50
    const smartRouterCost = 3 * 0 + 3 * 0.25 + 2 * 0.28 + 2 * 5.0; // Mixed routing = $11.31
    const savings = allOpusCost - smartRouterCost; // $50 - $11.31 = $38.69
    
    expect(savings).toBeCloseTo(38.69, 0.01); // Actual calculation
    expect(savings / allOpusCost).toBeCloseTo(0.774, 0.01); // ~77.4% savings
  });
});

describe('Pattern Matching', () => {
  test('should count pattern matches correctly', () => {
    const classifier = new IntentClassifier();
    
    // Access private method through type assertion for testing
    const classifierAny = classifier as any;
    
    // Test simple patterns
    expect(classifierAny.countMatches('git status help', ['git', 'status', 'help'])).toBe(3);
    expect(classifierAny.countMatches('git status', ['git', 'status', 'help'])).toBe(2);
    expect(classifierAny.countMatches('random text', ['git', 'status', 'help'])).toBe(0);
  });
});
