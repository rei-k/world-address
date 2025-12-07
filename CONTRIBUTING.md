# Contributing to World Address YAML

Thank you for your interest in contributing to World Address YAML! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## 📜 Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### Adding or Updating Address Data

The most valuable contribution is improving the address data:

1. **Adding new countries/regions**: Follow the schema in `docs/schema/README.md`
2. **Updating existing data**: Correct errors or add missing information
3. **Adding POS data**: Add point-of-sale information (currency, tax, receipts)
4. **Adding geocoding data**: Add latitude/longitude coordinates

### Improving SDKs

We welcome improvements to the SDK packages:

- Bug fixes
- Performance improvements
- New features
- Better documentation
- Additional examples

### Documentation

Help us improve documentation:

- Fix typos and errors
- Improve clarity
- Add examples
- Translate to other languages

## 💻 Development Setup

### Prerequisites

- Node.js 18.x or higher (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm 9.x or higher
- Git

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/world-address-yaml.git
   cd world-address-yaml
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/rei-k/world-address-yaml.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Verify your setup**:
   ```bash
   npm run validate:data
   npm run lint
   ```

### Working with SDKs

For SDK development:

```bash
cd sdk/core
npm install
npm run build
npm run test
```

## 📝 Coding Standards

### JavaScript/Node.js (Scripts)

- **Style**: Follow ESLint configuration (`.eslintrc.json`)
- **Formatting**: Use Prettier (`.prettierrc.json`)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Indentation**: 2 spaces
- **Variables**: Use `const` or `let`, never `var`

```javascript
// Good
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    logger.error(`Failed to fetch: ${error.message}`);
    throw error;
  }
};

// Bad
var fetchData = function(url) {
  fetch(url).then(response => {
    return response.json()
  })
}
```

### TypeScript (SDK)

- **Type Safety**: Use strict mode
- **Target**: ES2020
- **Module**: ESNext
- **Types**: Export all public types
- **Documentation**: JSDoc comments for public APIs

```typescript
/**
 * Validates an address against country-specific rules
 * @param address - The address to validate
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Validation result with errors if any
 */
export function validateAddress(
  address: AddressInput,
  countryCode: string
): ValidationResult {
  // Implementation
}
```

### YAML Data Files

- **Indentation**: 2 spaces
- **Quotes**: Use quotes for strings with special characters
- **Order**: Follow the schema order in `docs/schema/README.md`
- **Required fields**: Always include name, iso_codes, languages, address_format

Example:
```yaml
name:
  en: Japan
  local:
    - lang: ja
      value: 日本

iso_codes:
  alpha2: JP
  alpha3: JPN
  numeric: "392"

languages:
  - name: Japanese
    code: ja
    script: Japanese
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(data): add POS data for France (FR)

- Added currency information
- Added tax rates and categories
- Added receipt requirements

Closes #123
```

```
fix(sdk): correct postal code validation for Canada

The regex pattern was too strict and rejected valid postal codes
with lowercase letters.

Fixes #456
```

## 📤 Submitting Changes

### Before Submitting

1. **Run validation**:
   ```bash
   npm run validate:data
   ```

2. **Run linting**:
   ```bash
   npm run lint
   npm run format:check
   ```

3. **Run tests** (if modifying SDK):
   ```bash
   cd sdk/core
   npm run test
   npm run typecheck
   ```

4. **Update documentation** if needed

5. **Add examples** if adding new features

### Pull Request Process

1. **Create a branch**:
   ```bash
   git checkout -b feat/add-france-pos-data
   ```

2. **Make your changes** following coding standards

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat(data): add POS data for France"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feat/add-france-pos-data
   ```

5. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Fill out the PR template
   - Reference related issues
   - Add screenshots if UI changes

6. **Wait for review**:
   - Address review feedback promptly
   - Keep the conversation respectful
   - Be patient - maintainers are volunteers

### Pull Request Requirements

✅ **Must have**:
- Clear description of changes
- All tests passing
- No linting errors
- Documentation updated (if applicable)
- Follows coding standards
- Conventional commit messages

❌ **Will be rejected**:
- Breaking changes without discussion
- No description
- Failing tests
- Linting errors
- Unrelated changes mixed in
- Political/sensitive changes without consensus

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** - Your bug might already be reported
2. **Update to latest version** - Bug might be fixed
3. **Verify the bug** - Ensure it's reproducible

### Bug Report Template

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) when creating a new issue.

Use the bug report template when creating an issue:

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., macOS 14.0]
 - Node.js version: [e.g., 18.17.0]
 - Package version: [e.g., 1.0.0]

**Additional context**
Any other context about the problem.
```

## 💡 Suggesting Enhancements

### Feature Request Template

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) when creating a new issue.

For detailed feature proposals:
- Describe the problem or use case
- Propose a solution with examples
- Consider alternatives
- Estimate implementation effort
- Discuss backward compatibility

## 📊 Data Contribution Guidelines

### Adding Country/Region Data

1. **Research thoroughly**: Use official government sources
2. **Follow the schema**: See `docs/schema/README.md`
3. **Validate data**: Run `npm run validate:data`
4. **Check examples**: Review `docs/examples/` for reference
5. **Add both formats**: Create both `.yaml` and `.json` files

### Directory Structure

```
data/
├── {continent}/
│   └── {region}/
│       └── {ISO-CODE}/
│           ├── {ISO-CODE}.yaml    # Main country data
│           ├── {ISO-CODE}.json    # JSON format
│           ├── overseas/          # Overseas territories (if any)
│           └── regions/           # Special regions (if any)
```

### Political Sensitivity

For disputed territories or politically sensitive data:

1. **Discuss first**: Open an issue before submitting
2. **Use neutral language**: Stick to factual, neutral descriptions
3. **Document sources**: Provide official sources
4. **Follow precedent**: See existing disputed territory examples
5. **Mark status**: Use the `status` field appropriately

## 🔍 Review Process

### Timeline

- **Initial response**: Within 3-5 business days
- **Review completion**: Within 1-2 weeks for simple PRs
- **Complex PRs**: May take longer, we'll communicate timelines

### What We Look For

✅ Code quality
✅ Test coverage
✅ Documentation
✅ Performance impact
✅ Security implications
✅ Breaking changes
✅ Consistent style

## 🏆 Recognition

Contributors are recognized in:
- README.md (major contributors)
- CHANGELOG.md (per release)
- GitHub contributors page

## 🧪 Testing Guidelines

### Unit Testing

For SDK changes, write comprehensive unit tests:

```typescript
import { describe, it, expect } from 'vitest';
import { validateAddress } from '../src/validator';

describe('Address Validation', () => {
  it('should validate Japanese postal code format', () => {
    const result = validateAddress(
      { postal_code: '100-0001', country: 'JP' },
      jpFormat
    );
    expect(result.valid).toBe(true);
  });

  it('should reject invalid postal code', () => {
    const result = validateAddress(
      { postal_code: '12345', country: 'JP' },
      jpFormat
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid postal code format');
  });
});
```

### Integration Testing

For complex features, add integration tests:

```typescript
describe('Complete Address Flow', () => {
  it('should validate, format, and normalize address', async () => {
    const format = await loadCountryFormat('JP');
    
    // Validate
    const validation = validateAddress(testAddress, format);
    expect(validation.valid).toBe(true);
    
    // Format
    const formatted = formatAddress(validation.normalized, format);
    expect(formatted).toContain('東京都');
    
    // Normalize
    const normalized = normalizeAddress(testAddress, 'JP');
    expect(normalized.country).toBe('JP');
  });
});
```

### Test Coverage

Aim for:
- **Unit tests**: 80%+ coverage
- **Critical paths**: 100% coverage
- **Edge cases**: Well documented test cases
- **Error handling**: Test all error scenarios

### Running Tests

```bash
# Run all tests
cd sdk/core && npm test

# Run specific test file
npm test -- validator.test.ts

# Run with coverage
npm run test:coverage

# Watch mode for development
npm test -- --watch
```

## 📖 Documentation Standards

### Code Documentation

Use JSDoc for all public APIs:

```typescript
/**
 * Validates an address against country-specific rules.
 * 
 * This function checks postal codes, required fields, and format
 * according to the country's address standards.
 * 
 * @param address - The address object to validate
 * @param countryFormat - Country-specific address format rules
 * @returns Validation result with normalized address and errors
 * @throws {ValidationError} If country format is invalid
 * 
 * @example
 * ```typescript
 * const result = validateAddress(
 *   { country: 'JP', postal_code: '100-0001' },
 *   jpFormat
 * );
 * if (result.valid) {
 *   console.log('Address is valid:', result.normalized);
 * }
 * ```
 */
export function validateAddress(
  address: AddressInput,
  countryFormat: CountryFormat
): ValidationResult {
  // Implementation
}
```

### README Updates

When adding features, update relevant README files:

1. **Main README**: Add to features list if user-facing
2. **SDK README**: Document new SDK functions
3. **Examples README**: Add example if applicable
4. **Changelog**: Add entry for the change

### Writing Examples

Good examples are:
- **Self-contained**: Work independently
- **Commented**: Explain each step
- **Practical**: Show real-world use cases
- **Complete**: Include error handling
- **Tested**: Verified to work

Example template:

```typescript
/**
 * Example: Validating International Addresses
 * 
 * This example shows how to validate addresses from different
 * countries with their specific requirements.
 */

import { validateAddress, loadCountryFormat } from '@vey/core';

async function main() {
  // 1. Load country format
  const jpFormat = await loadCountryFormat('JP');
  
  // 2. Validate Japanese address
  const jpAddress = {
    country: 'JP',
    postal_code: '100-0001',
    province: '東京都',
    city: '千代田区',
  };
  
  const result = validateAddress(jpAddress, jpFormat);
  
  // 3. Check result
  if (result.valid) {
    console.log('✅ Valid address:', result.normalized);
  } else {
    console.error('❌ Invalid address:', result.errors);
  }
}

main().catch(console.error);
```

## 🔐 Security Guidelines

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security contact (see SECURITY.md)
2. Include detailed description
3. Provide steps to reproduce
4. Suggest a fix if possible

### Code Security

When contributing code:

- ✅ Validate all user inputs
- ✅ Sanitize outputs
- ✅ Use parameterized queries
- ✅ Avoid eval() and similar
- ✅ Keep dependencies updated
- ✅ Follow principle of least privilege
- ❌ Never commit secrets or API keys
- ❌ Don't use weak cryptography
- ❌ Avoid SQL injection risks

### ZKP Security

For ZKP-related contributions:

- Follow cryptographic best practices
- Use established libraries (no custom crypto)
- Validate all proofs before use
- Test against known attack vectors
- Document security assumptions

## 🌍 Internationalization (i18n)

### Adding Translations

When adding country data:

1. **Include local names**: Add `name.local` with native language
2. **Multiple scripts**: Support different writing systems
3. **Character encoding**: Always use UTF-8
4. **Test rendering**: Verify text displays correctly

Example:

```yaml
name:
  en: Japan
  local:
    - lang: ja
      value: 日本
    - lang: ja-Latn
      value: Nippon

languages:
  - name: Japanese
    code: ja
    script: Japanese
    native: 日本語
```

### Language Codes

- Use ISO 639-1 (2-letter) or ISO 639-3 (3-letter)
- Include script tag if needed (e.g., `ja-Latn`, `zh-Hans`)
- Document any non-standard codes

## 🎯 Performance Guidelines

### Data Files

- Keep YAML files < 100KB when possible
- Use references for repeated data
- Minimize nesting depth
- Validate data structure efficiency

### SDK Performance

- Lazy load country data
- Cache frequently used formats
- Optimize regex patterns
- Use efficient data structures
- Profile critical paths

Example:

```typescript
// ❌ Bad: Load all countries upfront
const allFormats = await loadAllCountries();

// ✅ Good: Load on demand
const formatCache = new Map();
async function getFormat(country: string) {
  if (!formatCache.has(country)) {
    formatCache.set(country, await loadCountryFormat(country));
  }
  return formatCache.get(country);
}
```

## 🏆 Recognition

## 📞 Getting Help

- **Questions**: Use [GitHub Discussions](https://github.com/rei-k/world-address-yaml/discussions)
- **Chat**: Join our community chat (if available)
- **Email**: For private concerns, contact maintainers

## 📚 Additional Resources

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [Schema Documentation](docs/schema/README.md) - Data schema reference
- [SDK Documentation](sdk/README.md) - SDK usage guide

## 🙏 Thank You

Thank you for contributing to World Address YAML! Your efforts help make international address handling better for everyone.

---

**Questions?** Open an issue or discussion - we're here to help! 🚀
