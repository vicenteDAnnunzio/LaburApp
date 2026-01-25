# Test del endpoint PUT /api/providers/me
# Ejecutar: .\test-update-provider.ps1

Write-Host "`n🧪 Testing PUT /api/providers/me`n" -ForegroundColor Cyan

# Primero, hacer login como PROVIDER para obtener el token
Write-Host "Obteniendo token de proveedor..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "maria.gomez@test.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    Write-Host "✅ Login exitoso - Token obtenido" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ No se pudo obtener token. Registrando nuevo proveedor..." -ForegroundColor Yellow
    
    # Si no existe, registrar un nuevo proveedor
    try {
        $registerBody = @{
            name = "Pedro Martinez"
            email = "pedro.martinez@test.com"
            password = "password123"
            role = "PROVIDER"
            providerProfile = @{
                zona = "Zona Centro"
                servicios = @("Carpinteria")
                experiencia = 3
                descripcion = "Carpintero profesional"
                telefono = "+56987654321"
            }
        } | ConvertTo-Json -Depth 3

        $registerResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
            -Method POST `
            -Body $registerBody `
            -ContentType "application/json"

        $token = $registerResponse.token
        Write-Host "✅ Proveedor registrado - Token obtenido" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "❌ Error al obtener token: $_" -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Actualizar zona
Write-Host "Test 1: Actualizar zona" -ForegroundColor Yellow
try {
    $body = @{
        zona = "Zona Sur"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Nueva zona:" $response.zona
    Write-Host ""
} catch {
    Write-Host "❌ Test 1 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Actualizar servicios y experiencia
Write-Host "Test 2: Actualizar servicios y experiencia" -ForegroundColor Yellow
try {
    $body = @{
        servicios = @("Carpinteria", "Pintura", "Remodelaciones")
        experiencia = 5
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Servicios:" ($response.servicios -join ", ")
    Write-Host "Experiencia:" $response.experiencia "años"
    Write-Host ""
} catch {
    Write-Host "❌ Test 2 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Actualizar descripción y teléfono
Write-Host "Test 3: Actualizar descripción y teléfono" -ForegroundColor Yellow
try {
    $body = @{
        descripcion = "Carpintero y pintor con 5 años de experiencia. Especialista en remodelaciones."
        telefono = "+56911223344"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Descripción:" $response.descripcion
    Write-Host "Teléfono:" $response.telefono
    Write-Host ""
} catch {
    Write-Host "❌ Test 3 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Actualizar todos los campos
Write-Host "Test 4: Actualizar todos los campos" -ForegroundColor Yellow
try {
    $body = @{
        zona = "Zona Norte"
        servicios = @("Plomeria", "Electricidad", "Gasfiteria")
        experiencia = 7
        descripcion = "Plomero y electricista certificado con amplia experiencia"
        telefono = "+56999888777"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Zona:" $response.zona
    Write-Host "Servicios:" ($response.servicios -join ", ")
    Write-Host "Experiencia:" $response.experiencia "años"
    Write-Host "Descripción:" $response.descripcion
    Write-Host "Teléfono:" $response.telefono
    Write-Host ""
} catch {
    Write-Host "❌ Test 4 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Sin token (debe devolver 401)
Write-Host "Test 5: Sin autenticación - debe devolver 401" -ForegroundColor Yellow
try {
    $body = @{
        zona = "Test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Body $body `
        -ContentType "application/json"

    Write-Host "❌ Test 5 should have failed (expected 401)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Status: 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 401, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 6: Con token de CLIENT (debe devolver 403)
Write-Host "Test 6: Con rol CLIENT - debe devolver 403" -ForegroundColor Yellow
try {
    # Login como cliente
    $clientLoginBody = @{
        email = "juan.perez@test.com"
        password = "password123"
    } | ConvertTo-Json

    $clientLoginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $clientLoginBody `
        -ContentType "application/json"

    $clientHeaders = @{
        "Authorization" = "Bearer $($clientLoginResponse.token)"
        "Content-Type" = "application/json"
    }

    $body = @{
        zona = "Test"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $clientHeaders `
        -Body $body

    Write-Host "❌ Test 6 should have failed (expected 403)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "✅ Status: 403 Forbidden (Insufficient permissions)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 403, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 7: Body vacío (debe devolver 400)
Write-Host "Test 7: Body vacío - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{} | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "❌ Test 7 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (At least one field required)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 8: Experiencia negativa (debe devolver 400)
Write-Host "Test 8: Experiencia negativa - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{
        experiencia = -1
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "❌ Test 8 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (Invalid experience)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 9: Servicios array vacío (debe devolver 400)
Write-Host "Test 9: Array de servicios vacío - debe devolver 400" -ForegroundColor Yellow
try {
    $body = @{
        servicios = @()
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers/me" `
        -Method PUT `
        -Headers $headers `
        -Body $body

    Write-Host "❌ Test 9 should have failed (expected 400)" -ForegroundColor Red
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Status: 400 Bad Request (At least one service required)" -ForegroundColor Green
    } else {
        Write-Host "❌ Expected 400, got $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✨ Tests completados`n" -ForegroundColor Cyan
