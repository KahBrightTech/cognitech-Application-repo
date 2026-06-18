// MovieNight Load Test with k6
// Usage: k6 run load-test.js --env BASE_URL=http://your-url

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
let errorRate = new Rate('errors');

// Test configuration
export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Spike to 100 users
    { duration: '3m', target: 50 },   // Back to 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% error rate
    errors: ['rate<0.05'],             // Less than 5% custom errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Utility function to generate random user name
function randomUser() {
  return `User${Math.floor(Math.random() * 10000)}`;
}

export default function () {
  group('Session Creation', function () {
    // Create a session
    let createRes = http.post(`${BASE_URL}/api/sessions`, JSON.stringify({
      userName: randomUser()
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    let createCheck = check(createRes, {
      'session created successfully': (r) => r.status === 200,
      'has session code': (r) => {
        let body = JSON.parse(r.body);
        return body.sessionCode && body.sessionCode.length === 6;
      },
    });
    
    errorRate.add(!createCheck);
    
    if (createCheck) {
      let sessionData = createRes.json();
      let sessionId = sessionData.sessionId;
      
      // Get session details
      group('Session Details', function () {
        let getRes = http.get(`${BASE_URL}/api/sessions/${sessionId}`);
        let getCheck = check(getRes, {
          'session retrieved': (r) => r.status === 200,
        });
        errorRate.add(!getCheck);
      });
    }
    
    sleep(1);
  });
  
  group('Movie Endpoints', function () {
    // Get movies
    let moviesRes = http.get(`${BASE_URL}/api/movies`);
    let moviesCheck = check(moviesRes, {
      'movies loaded': (r) => r.status === 200,
      'has movie data': (r) => {
        let body = JSON.parse(r.body);
        return body.movies && body.movies.length > 0;
      },
    });
    errorRate.add(!moviesCheck);
    
    // Get genres
    let genresRes = http.get(`${BASE_URL}/api/genres`);
    let genresCheck = check(genresRes, {
      'genres loaded': (r) => r.status === 200,
    });
    errorRate.add(!genresCheck);
    
    sleep(1);
  });
  
  group('Health Check', function () {
    let healthRes = http.get(`${BASE_URL}/health`);
    let healthCheck = check(healthRes, {
      'health check passed': (r) => r.status === 200,
    });
    errorRate.add(!healthCheck);
  });
  
  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  let indent = options.indent || '';
  let enableColors = options.enableColors || false;
  
  let summary = `
${indent}=====================================
${indent}📊 Load Test Results
${indent}=====================================
${indent}
${indent}Checks................: ${data.metrics.checks.values.passes}/${data.metrics.checks.values.passes + data.metrics.checks.values.fails} passed
${indent}HTTP Requests.........: ${data.metrics.http_reqs.values.count} total
${indent}HTTP Duration.........: avg=${data.metrics.http_req_duration.values.avg.toFixed(2)}ms, p(95)=${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}HTTP Failed...........: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
${indent}Errors................: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%
${indent}Virtual Users.........: max=${data.metrics.vus_max.values.max}
${indent}
${indent}=====================================
  `;
  
  return summary;
}
