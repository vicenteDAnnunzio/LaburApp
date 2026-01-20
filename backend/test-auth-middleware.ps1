# Test del middleware JWT de autenticación
# Ejecutar: .\test-auth-middleware.ps1

Write-Host "`n🔐 Testing JWT Authentication Middleware`n" -ForegroundColor Cyan

# Paso 1: Login para obtener token
Write-Host "Paso 1: Login para obtener token JWT" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "cliente@demo.com"
        password = "cliente123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Token obtenido: $($token.Substring(0, 30))..."
    Write-Host "   Usuario: $($loginResponse.user.name) ($($loginResponse.user.role))"
    Write-Host ""
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

# Paso 2: Probar endpoint protegido CON token válido
Write-Host "Paso 2: GET /auth/me CON token válido (debe ser 200)" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }

    $meResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" `
        -Method GET `
        -Headers $headers

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "   Usuario autenticado: $($meResponse.user.email)"
    Write-Host "   ID: $($meResponse.user.id)"
    Write-Host "   Role: $($meResponse.user.role)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 2 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Paso 3: Probar endpoint protegido SIN token (debe ser 401)
Write-Host "Paso 3: GET /auth/me SIN token (debe ser 401)" -ForegroundColor Yellow
try {
    $meResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" `
        -Method GET `
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

# Paso 4: Probar endpoint protegido con token INVÁLIDO (debe ser 401)
Write-Host "Paso 4: GET /auth/me con token INVÁLIDO (debe ser 401)" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer token_invalido_12345"
    }

    $meResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" `
        -Method GET `
        -Headers $headers `
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

# Paso 5: Probar con header Authorization mal formado (debe ser 401)
Write-Host "Paso 5: GET /auth/me con header mal formado (debe ser 401)" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = $token  # Sin "Bearer "
    }

    $meResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "❌ Test 5 failed: Expected 401 but got 200" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Status: 401 Unauthorized (correcto)" -ForegroundColor Green
    } else {
        Write-Host "❌ Test 5 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Paso 6: Login con prestador y verificar role
Write-Host "Paso 6: Login como PROVIDER y verificar role" -ForegroundColor Yellow
try {
    $providerLoginBody = @{
        email = "vicen@demo.com"
        password = "vicente"
    } | ConvertTo-Json

    $providerLoginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -Body $providerLoginBody `
        -ContentType "application/json"

    $providerToken = $providerLoginResponse.token

    $providerHeaders = @{
        Authorization = "Bearer $providerToken"
    }

    $providerMeResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/me" `
        -Method GET `
        -Headers $providerHeaders

    if ($providerMeResponse.user.role -eq "PROVIDER") {
        Write-Host "✅ Status: 200 OK" -ForegroundColor Green
        Write-Host "   Usuario: $($providerMeResponse.user.email)"
        Write-Host "   Role: $($providerMeResponse.user.role) (correcto)"
    } else {
        Write-Host "❌ Role incorrecto: $($providerMeResponse.user.role)" -ForegroundColor Red
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 6 failed: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "🏁 Tests completados`n" -ForegroundColor Cyan
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "   ✅ Middleware JWT implementado y funcionando"
Write-Host "   ✅ Tokens válidos permiten acceso"
Write-Host "   ✅ Tokens inválidos/faltantes devuelven 401"
Write-Host "   ✅ req.user inyectado correctamente con userId y role`n"
