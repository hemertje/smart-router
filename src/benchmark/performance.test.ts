// Performance benchmarks for Smart Router
import { IntentClassifier } from '../classifier';
import { EnhancedIntentClassifier } from '../enhancedClassifier';
import { Intent } from '../models';

describe('Performance Benchmarks', () => {
  const testQueries = [
    'git status',
    'create REST API endpoint',
    'why is this failing',
    'design system architecture',
    'help me understand this',
    'generate function for validation',
    'debug authentication issue',
    'plan microservices approach',
    'list all files',
    'implement user authentication',
    'error in database connection',
    'organize project structure',
    'what is this error',
    'build new component',
    'fix memory leak',
    'best practices for testing'
  ];

  describe('IntentClassifier Performance', () => {
    let classifier: IntentClassifier;

    beforeEach(() => {
      classifier = new IntentClassifier();
    });

    test('should classify 1000 queries quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const query = testQueries[i % testQueries.length];
        classifier.classify(query);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Classified 1000 queries in ${duration.toFixed(2)}ms`);
      console.log(`Average per query: ${(duration / 1000).toFixed(3)}ms`);
      
      // Should be under 100ms for 1000 queries (0.1ms per query)
      expect(duration).toBeLessThan(100);
    });

    test('should handle large queries efficiently', () => {
      const largeQuery = 'create ' + 'very '.repeat(100) + 'long ' + 'query ' + 'with ' + 'many ' + 'words';
      
      const startTime = performance.now();
      const result = classifier.classify(largeQuery);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(result).toBe('code_gen');
      expect(duration).toBeLessThan(1); // Should be under 1ms even for large queries
    });
  });

  describe('EnhancedIntentClassifier Performance', () => {
    let classifier: EnhancedIntentClassifier;

    beforeEach(() => {
      classifier = new EnhancedIntentClassifier();
    });

    test('should classify with ML features efficiently', async () => {
      const startTime = performance.now();
      
      // Test with user preferences
      classifier.setUserPreference('deploy app', 'code_gen');
      classifier.setUserPreference('fix bug', 'debug');
      classifier.setUserPreference('design ui', 'architecture');
      
      // Classify queries
      for (let i = 0; i < 100; i++) {
        const query = testQueries[i % testQueries.length];
        await classifier.classify(query);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Enhanced classification of 100 queries in ${duration.toFixed(2)}ms`);
      console.log(`Average per query: ${(duration / 100).toFixed(3)}ms`);
      
      // Should be under 500ms for 100 queries with ML features
      expect(duration).toBeLessThan(500);
    });

    test('should handle pattern history efficiently', async () => {
      // Build up pattern history
      for (let i = 0; i < 50; i++) {
        await classifier.classify(`similar query ${i}`);
      }
      
      const startTime = performance.now();
      
      // Now test similar queries
      await classifier.classify('similar query test');
      await classifier.classify('similar query example');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5); // Should benefit from history
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory with repeated classifications', () => {
      const classifier = new IntentClassifier();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const initialMemory = process.memoryUsage();
      
      // Perform many classifications
      for (let i = 0; i < 10000; i++) {
        const query = testQueries[i % testQueries.length] + ' ' + i;
        classifier.classify(query);
      }
      
      // Force garbage collection again
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // Should not increase memory significantly
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Concurrent Classification', () => {
    test('should handle concurrent classifications', async () => {
      const classifier = new EnhancedIntentClassifier();
      const promises: Promise<any>[] = [];
      
      const startTime = performance.now();
      
      // Create 100 concurrent classification tasks
      for (let i = 0; i < 100; i++) {
        const query = testQueries[i % testQueries.length];
        promises.push(classifier.classify(query));
      }
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      
      // Verify all results are valid intents
      const validIntents: Intent[] = ['simple', 'code_gen', 'debug', 'architecture'];
      results.forEach(result => {
        expect(validIntents).toContain(result.intent);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });
    });
  });
});
