# MovieNight Health Check Script
# Usage: .\health-check.ps1 -Url "http://your-url" -Environment "dev"

param(
    [string]$Url = "http://localhost",
    [string]$Environment = "local"
)

Write-Host "`n🏥 MovieNight Health Check - $Environment" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$EndpointUrl,
        [string]$Method = "GET"
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $EndpointUrl -Method Get -TimeoutSec 10
        } else {
            $response = Invoke-WebRequest -Uri $EndpointUrl -Method Post -TimeoutSec 10
        }
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host "❌ FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:failed++
            return $false
        }
    } catch {
        Write-Host "❌ FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

# Run tests
Write-Host "Testing against: $Url`n"

Test-Endpoint -Name "Backend Health" -EndpointUrl "$Url/api/health"
Test-Endpoint -Name "Frontend Load" -EndpointUrl "$Url/"
Test-Endpoint -Name "Get Movies" -EndpointUrl "$Url/api/movies"
Test-Endpoint -Name "Get Genres" -EndpointUrl "$Url/api/genres"

# Test session creation
Write-Host "Testing Create Session... " -NoNewline
try {
    $body = @{
        userName = "TestUser$(Get-Random -Maximum 9999)"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$Url/api/sessions" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
    
    if ($response.sessionCode -and $response.sessionCode.Length -eq 6) {
        Write-Host "✅ PASS (Code: $($response.sessionCode))" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL (Invalid session code)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL ($($_.Exception.Message))" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Results: " -NoNewline
Write-Host "$passed passed" -ForegroundColor Green -NoNewline
Write-Host ", " -NoNewline
Write-Host "$failed failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "`n✅ All health checks passed!`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some health checks failed!`n" -ForegroundColor Red
    exit 1
}
