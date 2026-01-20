# Test del endpoint POST /auth/login
# Ejecutar: .\test-login.ps1

Write-Host "`n🧪 Testing POST /auth/login`n" -ForegroundColor Cyan

# Test 1: Login exitoso con cliente
Write-Host "Test 1: Login exitoso - Cliente" -ForegroundColor Yellow
try {
    $body = @{
        email = "cliente@demo.com"
        password = "cliente123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Token:" $response.token.Substring(0, 50) "..."
    Write-Host "User: $($response.user.name) - $($response.user.email) - $($response.user.role)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 1 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Login exitoso con prestador
Write-Host "Test 2: Login exitoso - Prestador" -ForegroundColor Yellow
try {
    $body = @{
        email = "vicen@demo.com"
        password = "vicente"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Token:" $response.token.Substring(0, 50) "..."
    Write-Host "User: $($response.user.name) - $($response.user.email) - $($response.user.role)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 2 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Email no existe (debe devolver 401)
Write-Host "Test 3: Email no existe (debe ser 401)" -ForegroundColor Yellow
try {
    $body = @{
        email = "noexiste@demo.com"
        password = "cualquiera"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "❌ Test 3 failed: Expected 401 but got 200" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Status: 401 Unauthorized (correcto)" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 3 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: Password incorrecta (debe devolver 401)
Write-Host "Test 4: Password incorrecta (debe ser 401)" -ForegroundColor Yellow
try {
    $body = @{
        email = "cliente@demo.com"
        password = "passwordincorrecta"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "❌ Test 4 failed: Expected 401 but got 200" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Status: 401 Unauthorized (correcto)" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 4 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Email inválido (debe devolver 400)
Write-Host "Test 5: Email inválido (debe ser 400)" -ForegroundColor Yellow
try {
    $body = @{
        email = "emailinvalido"
        password = "cualquiera"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "❌ Test 5 failed: Expected 400 but got 200" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (correcto)" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 5 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "🏁 Tests completados`n" -ForegroundColor Cyan
