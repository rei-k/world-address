# VeyExpress Testing Guide

This directory contains comprehensive tests for the VeyExpress platform.

## Test Structure

```
tests/
├── sdk/           # SDK core tests
├── api/           # API client tests
└── services/      # Service layer tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/sdk/index.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Writing Tests

### Example Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { VeyExpressSDK } from '../../src/sdk';

describe('Feature Name', () => {
  let sdk: VeyExpressSDK;

  beforeEach(() => {
    sdk = new VeyExpressSDK('test-api-key');
  });

  it('should do something', async () => {
    const result = await sdk.someMethod();
    expect(result).toBeDefined();
  });
});
```

## Test Coverage Goals

- SDK Core: >90%
- API Clients: >85%
- Services: >80%
- Overall: >85%

## Mocking

We use Vitest's built-in mocking capabilities:

```typescript
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock implementation
(global.fetch as any).mockResolvedValue({
  json: async () => ({ success: true })
});
```

## Best Practices

1. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Follow the AAA pattern for test organization
3. **One Assertion Per Test**: Focus each test on a single behavior
4. **Clean Setup**: Use `beforeEach` for test setup
5. **Mock External Dependencies**: Mock API calls, file system, etc.

## Test Categories

### Unit Tests
Test individual functions and methods in isolation.

### Integration Tests
Test interaction between components.

### End-to-End Tests
Test complete user workflows.

## Continuous Integration

Tests run automatically on:
- Pull request creation
- Push to main branch
- Daily scheduled runs

## Debugging Tests

```bash
# Run single test file with verbose output
npm test -- tests/sdk/index.test.ts --reporter=verbose

# Run specific test by name
npm test -- --grep "should validate address"
```

## Coverage Reports

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - HTML report
- `coverage/coverage-final.json` - JSON report
- `coverage/lcov.info` - LCOV format

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass
3. Maintain or improve coverage
4. Update this README if needed
