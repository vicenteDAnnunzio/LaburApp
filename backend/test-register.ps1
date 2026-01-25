# Test del endpoint POST /auth/register
# Ejecutar: .\test-register.ps1

Write-Host "`n🧪 Testing POST /auth/register`n" -ForegroundColor Cyan

# Test 1: Registro exitoso de CLIENT
Write-Host "Test 1: Registro exitoso - CLIENT" -ForegroundColor Yellow
try {
    $body = @{
        name = "Juan Perez"
        email = "juan.perez@test.com"
        password = "password123"
        role = "CLIENT"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "✅ Status: 201 Created" -ForegroundColor Green
    Write-Host "Token:" $response.token.Substring(0, 50) "..."
    Write-Host "User: $($response.user.name) - $($response.user.email) - $($response.user.role)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 1 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Registro exitoso de PROVIDER con perfil
Write-Host "Test 2: Registro exitoso - PROVIDER con perfil" -ForegroundColor Yellow
try {
    $body = @{
        name = "Maria Gomez"
        email = "maria.gomez@test.com"
        password = "password123"
        role = "PROVIDER"
        providerProfile = @{
            zona = "Zona Norte"
            servicios = @("Plomeria", "Electricidad")
            experiencia = 5
            descripcion = "Plomero y electricista con 5 años de experiencia"
            telefono = "+56912345678"
        }
    } | ConvertTo-Json -Depth 3

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "✅ Status: 201 Created" -ForegroundColor Green
    Write-Host "Token:" $response.token.Substring(0, 50) "..."
    Write-Host "User: $($response.user.name) - $($response.user.email) - $($response.user.role)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 2 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Email duplicado (debe devolver 409)
Write-Host "Test 3: Email duplicado - debe devolver 409" -ForegroundColor Yellow
try {
    $body = @{
        name = "Juan Perez Duplicado"
        email = "juan.perez@test.com"
        password = "password123"
        role = "CLIENT"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "❌ Test 3 should have failed (expected 409)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "✅ Status: 409 Conflict (Email already exists)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 409, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: PROVIDER sin providerProfile (debe devolver 400)
Write-Host "Test 4: PROVIDER sin providerProfile - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{
        name = "Carlos Lopez"
        email = "carlos.lopez@test.com"
        password = "password123"
        role = "PROVIDER"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "❌ Test 4 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (providerProfile required)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Validación de email inválido (debe devolver 400)
Write-Host "Test 5: Email inválido - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "invalid-email"
        password = "password123"
        role = "CLIENT"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "❌ Test 5 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (Invalid email format)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 6: Password muy corto (debe devolver 400)
Write-Host "Test 6: Password corto - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test.short@test.com"
        password = "123"
        role = "CLIENT"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "❌ Test 6 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (Password too short)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 7: Role inválido (debe devolver 400)
Write-Host "Test 7: Role inválido - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test.role@test.com"
        password = "password123"
        role = "ADMIN"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "❌ Test 7 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (Invalid role)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 8: Verificar que se puede hacer login con el usuario registrado
Write-Host "Test 8: Login con usuario recién registrado" -ForegroundColor Yellow
try {
    $body = @{
        email = "juan.perez@test.com"
        password = "password123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK - Login exitoso con usuario registrado" -ForegroundColor Green
    Write-Host "User: $($response.user.name) - $($response.user.role)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 8 failed: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✨ Tests completados`n" -ForegroundColor Cyan
