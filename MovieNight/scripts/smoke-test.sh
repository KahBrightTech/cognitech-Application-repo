#!/bin/bash

# MovieNight - Smoke Tests
# Quick health check for any environment

ENVIRONMENT="${1:-local}"
BASE_URL="${2:-http://localhost}"

echo "🧪 MovieNight Smoke Tests - $ENVIRONMENT"
echo "========================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
run_test() {
  local test_name="$1"
  local test_command="$2"
  
  echo -n "Testing $test_name... "
  
  if eval "$test_command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
  fi
}

# Run tests
echo ""
echo "Running tests against: $BASE_URL"
echo ""

run_test "Backend Health" "curl -f -s $BASE_URL/api/health"
run_test "Frontend Load" "curl -f -s $BASE_URL/"
run_test "Get Movies Endpoint" "curl -f -s $BASE_URL/api/movies"
run_test "Get Genres Endpoint" "curl -f -s $BASE_URL/api/genres"

# Create session test
echo -n "Testing Create Session... "
SESSION_RESPONSE=$(curl -s -X POST $BASE_URL/api/sessions)
SESSION_CODE=$(echo $SESSION_RESPONSE | jq -r '.sessionCode' 2>/dev/null)

if [ -n "$SESSION_CODE" ] && [ "$SESSION_CODE" != "null" ]; then
  echo -e "${GREEN}✅ PASS${NC} (Code: $SESSION_CODE)"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC}"
  ((FAILED++))
fi

# Summary
echo ""
echo "========================================="
echo "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All smoke tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  exit 1
fi
