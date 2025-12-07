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

**Before you start:**
- Check if an issue or PR already exists for this country/region
- Verify your data against official sources (postal services, ISO standards)
- Review the schema documentation carefully

### Improving SDKs

We welcome improvements to the SDK packages:

- **Bug fixes**: Fix issues in validation, formatting, or other SDK functions
- **Performance improvements**: Optimize algorithms or reduce bundle size
- **New features**: Add new capabilities (discuss in an issue first)
- **Better documentation**: Improve JSDoc comments or README
- **Additional examples**: Create examples for different frameworks

### Documentation

Help us improve documentation:

- **Fix typos and errors**: Even small improvements matter
- **Improve clarity**: Make explanations easier to understand
- **Add examples**: Show real-world usage patterns
- **Translate to other languages**: Help international users
- **Create guides**: Write tutorials or how-to guides

### Reporting Bugs

Found a bug? Please report it:

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template** when creating an issue
3. **Provide reproduction steps** - we need to reproduce the bug
4. **Include environment details** - OS, Node version, SDK version
5. **Add screenshots** if applicable

### Suggesting Enhancements

Have an idea for improvement?

1. **Check existing issues** for similar suggestions
2. **Use the feature request template**
3. **Explain the use case** - why is this needed?
4. **Consider alternatives** - what other approaches exist?
5. **Be open to discussion** - the maintainers may suggest modifications

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

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you thought about.

**Additional context**
Mockups, examples, or other context.
```

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

---

## 🐛 Detailed Bug Reporting Guide

### What Makes a Good Bug Report?

A good bug report should be:
- **Reproducible**: Others can follow the steps and see the same issue
- **Specific**: Clearly describes what's wrong
- **Complete**: Includes all necessary information
- **Isolated**: Tests only one issue at a time

### Bug Report Checklist

✅ Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)  
✅ Search existing issues first  
✅ Include steps to reproduce  
✅ Specify environment (OS, Node version, SDK version)  
✅ Add screenshots if applicable  
✅ Include error messages or logs  

---

## ✨ Detailed Feature Request Guide

### What Makes a Good Feature Request?

A good feature request should:
- **Solve a real problem**: Address an actual user need
- **Be well-scoped**: Clear boundaries and requirements
- **Consider alternatives**: Show you've thought about different approaches
- **Include use cases**: Provide concrete examples

### Feature Request Checklist

✅ Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)  
✅ Check if similar requests exist  
✅ Explain the problem it solves  
✅ Provide specific use cases  
✅ Consider implementation complexity  
✅ Be open to discussion and modifications  

---

## 🎨 Examples Contribution Guide

### Adding New Framework Examples

We welcome examples for any framework! Structure:

```
examples/[framework]-example/
├── README.md          # Setup and usage
├── package.json       # Dependencies
└── src/              # Source code
```

**Requirements:**
1. ✅ Clear README with setup instructions
2. ✅ Well-commented code
3. ✅ Follows framework best practices
4. ✅ Runs without errors
5. ✅ Minimal dependencies

**Good Frameworks to Add:** Angular, Svelte, Solid, React Native, Flutter, Python, PHP, Ruby, Go, Java

---

## 🧪 Testing Guidelines

### For Data Changes

```bash
npm run validate:data  # Validate YAML
npm run stats:data     # Check completeness
npm run lint           # Check code style
```

### For SDK Changes

```bash
cd sdk/core
npm run test           # Run all tests
npm run test:coverage  # Check coverage
npm run build          # Build SDK
npm run lint           # Lint code
```

---
