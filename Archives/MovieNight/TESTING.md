# MovieNight Testing Guide

## Overview
MovieNight now has comprehensive testing configured for both backend (Jest) and frontend (Vitest). Tests run automatically in CI/CD before building and deploying.

## Backend Testing (Jest + Supertest)

### Configuration
- **Framework**: Jest 29.7.0
- **HTTP Testing**: Supertest 6.3.3
- **Config File**: `jest.config.js`

### Test Scripts
```bash
# Run tests once with coverage
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests in CI mode (non-interactive)
npm run test:ci
```

### Test Files
- `__tests__/health.test.js` - Tests for health check endpoint
- `__tests__/api.test.js` - Tests for session management and data structures

### Running Tests Locally
```bash
cd MovieNight/backend

# Install dependencies (including devDependencies)
npm install

# Run tests
npm test

# Run tests with coverage report
npm run test:ci
```

### Writing New Tests
Create test files in `__tests__/` directory or name them `*.test.js`:

```javascript
const request = require('supertest');

describe('My API Endpoint', () => {
  test('should do something', async () => {
    const response = await request(app).get('/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Frontend Testing (Vitest + React Testing Library)

### Configuration
- **Framework**: Vitest 1.0.0
- **Component Testing**: @testing-library/react 14.1.2
- **DOM Testing**: @testing-library/jest-dom 6.1.5
- **Environment**: jsdom 23.0.0
- **Config**: Added to `vite.config.js`

### Test Scripts
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Files
- `src/test/setup.js` - Test environment setup
- `src/test/App.test.jsx` - App component tests
- `src/test/basic.test.js` - Basic unit tests

### Running Tests Locally
```bash
cd MovieNight/frontend

# Install dependencies (including devDependencies)
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Writing New Tests
Create test files alongside components or in `src/test/`:

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## CI/CD Pipeline Testing

### Workflow Order
1. **Checkout code**
2. **Set up Node.js 18**
3. **Install dependencies** (both backend and frontend)
4. **Run backend tests** (must pass)
5. **Run frontend tests** (must pass)
6. **Build Docker images** (only if tests pass)
7. **Push to ECR** (versioned + latest tags)
8. **Deploy to EKS**

### Test Failure Behavior
- If **backend tests fail**, the workflow stops immediately
- If **frontend tests fail**, the workflow stops immediately
- Docker images are **NOT built** if tests fail
- Deployment **does NOT proceed** if tests fail

### Viewing Test Results
Check GitHub Actions logs:
1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. Expand **"Run backend tests"** or **"Run frontend tests"** steps
4. View test output and coverage reports

## Testing in Docker Containers

### Backend Dockerfile
The production Dockerfile uses `npm install --production`, which skips devDependencies. Tests run **before** Docker build in CI/CD.

### Frontend Dockerfile
Uses multi-stage build. Tests run **before** Docker build in CI/CD.

### Local Docker Testing
If you want to test the Docker images locally:

```bash
# Build images
cd MovieNight/backend
docker build -t movienight-backend:test .

cd ../frontend
docker build -t movienight-frontend:test .

# Test the images (basic health checks)
docker run --rm -p 3001:3001 movienight-backend:test &
curl http://localhost:3001/health

docker run --rm -p 80:80 movienight-frontend:test &
curl http://localhost/
```

## Test Coverage

### Backend Coverage
Current tests cover:
- ✅ Health check endpoint
- ✅ UUID generation and session ID creation
- ✅ Map-based session storage

To add more coverage:
- Test POST /api/sessions endpoint with real server
- Test Socket.io connections
- Test TMDB API integration (with mocks)

### Frontend Coverage
Current tests cover:
- ✅ App component rendering
- ✅ Basic JavaScript/React functionality

To add more coverage:
- Test individual components
- Test Socket.io client connections
- Test API calls with mocked axios

## Troubleshooting

### Backend Test Errors

**"Cannot find module 'jest'"**
```bash
cd MovieNight/backend
npm install
```

**"supertest connection refused"**
- Make sure you're not trying to test a running server
- Use supertest with the app instance, not a URL

### Frontend Test Errors

**"Cannot find module 'vitest'"**
```bash
cd MovieNight/frontend
npm install
```

**"ReferenceError: window is not defined"**
- Check that `vite.config.js` has `environment: 'jsdom'`
- Verify `src/test/setup.js` is imported

### CI/CD Test Failures

**Tests pass locally but fail in CI**
- Check Node.js version (CI uses Node 18)
- Verify all dependencies are in `package.json`
- Check for environment-specific issues

**"npm ci failed"**
- Delete `package-lock.json` and regenerate:
  ```bash
  rm package-lock.json
  npm install
  git add package-lock.json
  git commit -m "Update package-lock.json"
  ```

## Best Practices

### Writing Tests
1. **Keep tests focused** - One concept per test
2. **Use descriptive names** - "should return 200 when health endpoint is called"
3. **Test edge cases** - Empty inputs, null values, errors
4. **Mock external dependencies** - TMDB API, databases
5. **Clean up after tests** - Close connections, clear timers

### Test Organization
```
backend/
  __tests__/
    health.test.js      # Health endpoint tests
    api.test.js         # API endpoint tests
    socket.test.js      # Socket.io tests
    tmdb.test.js        # TMDB integration tests

frontend/
  src/
    test/
      setup.js          # Test setup
      basic.test.js     # Unit tests
    components/
      MyComponent.jsx
      MyComponent.test.jsx  # Component tests
```

### Running Tests Before Commit
Add a pre-commit hook to run tests:

```bash
# .git/hooks/pre-commit
#!/bin/sh
cd MovieNight/backend && npm test
cd ../frontend && npm test
```

## Next Steps

### Backend Testing Enhancements
- [ ] Add tests for POST /api/sessions
- [ ] Add tests for Socket.io connections
- [ ] Mock TMDB API calls
- [ ] Add integration tests with test database
- [ ] Increase coverage to 80%+

### Frontend Testing Enhancements
- [ ] Add tests for all React components
- [ ] Add tests for Socket.io client
- [ ] Add tests for API calls (mocked)
- [ ] Add E2E tests with Playwright
- [ ] Increase coverage to 80%+

### CI/CD Enhancements
- [ ] Upload coverage reports to Codecov
- [ ] Add test coverage thresholds
- [ ] Parallel test execution
- [ ] Cache npm dependencies
- [ ] Add test summary to PR comments
