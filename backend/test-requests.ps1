# --- Encoding UTF-8 para que no se rompan caracteres
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🧪 Testing Service Requests Endpoints" -ForegroundColor Cyan

$baseUrl = "http://localhost:4000"

function Get-Token($email, $password) {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  $resp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json"
  return $resp.token
}

function Assert-Status($scriptBlock, $expectedStatus, $label) {
  try {
    & $scriptBlock | Out-Null
    if ($expectedStatus -ne 200 -and $expectedStatus -ne 201 -and $expectedStatus -ne 204) {
      Write-Host "❌ $label Expected $expectedStatus but request succeeded" -ForegroundColor Red
    } else {
      Write-Host "✅ $label" -ForegroundColor Green
    }
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq $expectedStatus) {
      Write-Host "✅ $label (Status $status)" -ForegroundColor Green
    } else {
      $msg = $_.ErrorDetails.Message
      Write-Host "❌ $label Expected $expectedStatus, got $status. $msg" -ForegroundColor Red
    }
  }
}

# Paso 1: Token CLIENT
Write-Host "`n🧩 Paso 1: Obtener token de CLIENT" -ForegroundColor Cyan
$clientToken = Get-Token "cliente@demo.com" "cliente123"
if (-not $clientToken) { throw "No se pudo obtener token CLIENT" }
Write-Host "✅ Token CLIENT OK" -ForegroundColor Green

# Paso 2: Token PROVIDER
Write-Host "`n🧩 Paso 2: Obtener token de PROVIDER" -ForegroundColor Cyan
$providerToken = Get-Token "vicen@demo.com" "vicente"
if (-not $providerToken) { throw "No se pudo obtener token PROVIDER" }
Write-Host "✅ Token PROVIDER OK" -ForegroundColor Green

$clientHeaders   = @{ Authorization = "Bearer $clientToken" }
$providerHeaders = @{ Authorization = "Bearer $providerToken" }

# Test 1: Crear request como CLIENT
Write-Host "`nTest 1: Crear request como CLIENT" -ForegroundColor Yellow
$createBody = @{
  providerId  = "020bbdf0-71e2-4edc-8ec0-961ff5234ddf"  # ID del provider seed (ajustá si cambia)
  title       = "Prueba - Cambio de enchufe"
  description = "No funciona el enchufe del living"
  location    = "CABA"
  urgency     = "LOW"
} | ConvertTo-Json

$created = Invoke-RestMethod -Uri "$baseUrl/api/requests" -Method POST -Headers $clientHeaders -Body $createBody -ContentType "application/json"
Write-Host "✅ Creada request ID: $($created.id)" -ForegroundColor Green

$requestId = $created.id
if (-not $requestId) { throw "No se obtuvo requestId al crear request" }

# Test 2: Listar requests como CLIENT
Write-Host "`nTest 2: Listar requests como CLIENT" -ForegroundColor Yellow
$clientList = Invoke-RestMethod -Uri "$baseUrl/api/requests?as=client" -Method GET -Headers $clientHeaders
Write-Host "✅ Status: 200 OK | Total: $($clientList.Count)" -ForegroundColor Green

# Test 3: Listar requests como PROVIDER
Write-Host "`nTest 3: Listar requests como PROVIDER" -ForegroundColor Yellow
$providerList = Invoke-RestMethod -Uri "$baseUrl/api/requests?as=provider" -Method GET -Headers $providerHeaders
Write-Host "✅ Status: 200 OK | Total: $($providerList.Count)" -ForegroundColor Green

# Test 4: PROVIDER acepta la request (PATCH action=accept)
Write-Host "`nTest 4: PROVIDER acepta la request" -ForegroundColor Yellow
$acceptBody = @{ action = "accept" } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$baseUrl/api/requests/$requestId" -Method PATCH -Headers $providerHeaders -Body $acceptBody -ContentType "application/json"
Write-Host "✅ Status actualizado: $($updated.status)" -ForegroundColor Green

# Test 5: Crear otra request para rechazar
Write-Host "`nTest 5: Crear otra request para rechazar" -ForegroundColor Yellow
$createBody2 = @{
  providerId  = "020bbdf0-71e2-4edc-8ec0-961ff5234ddf"
  title       = "Prueba - Rechazo"
  description = "Algo para rechazar"
  location    = "CABA"
  urgency     = "LOW"
} | ConvertTo-Json

$created2 = Invoke-RestMethod -Uri "$baseUrl/api/requests" -Method POST -Headers $clientHeaders -Body $createBody2 -ContentType "application/json"
$rejectId = $created2.id
Write-Host "✅ Creada request ID: $rejectId" -ForegroundColor Green

# Test 6: PROVIDER rechaza la request
Write-Host "`nTest 6: PROVIDER rechaza la request" -ForegroundColor Yellow
$rejectBody = @{ action = "reject" } | ConvertTo-Json
$rejected = Invoke-RestMethod -Uri "$baseUrl/api/requests/$rejectId" -Method PATCH -Headers $providerHeaders -Body $rejectBody -ContentType "application/json"
Write-Host "✅ Status actualizado: $($rejected.status)" -ForegroundColor Green

# Test 7: CLIENT cancela una request
Write-Host "`nTest 7: CLIENT cancela una request" -ForegroundColor Yellow
$cancelBody = @{ action = "cancel" } | ConvertTo-Json
$cancelled = Invoke-RestMethod -Uri "$baseUrl/api/requests/$rejectId" -Method PATCH -Headers $clientHeaders -Body $cancelBody -ContentType "application/json"
Write-Host "✅ Status actualizado: $($cancelled.status)" -ForegroundColor Green

# Test 8: PROVIDER intenta crear request -> 403
Write-Host "`nTest 8: PROVIDER intenta crear request (espera 403)" -ForegroundColor Yellow
Assert-Status { Invoke-RestMethod -Uri "$baseUrl/api/requests" -Method POST -Headers $providerHeaders -Body $createBody -ContentType "application/json" } 403 "RBAC provider no puede crear"

# Test 9: CLIENT intenta aceptar -> 403
Write-Host "`nTest 9: CLIENT intenta aceptar (espera 403)" -ForegroundColor Yellow
Assert-Status { Invoke-RestMethod -Uri "$baseUrl/api/requests/$requestId" -Method PATCH -Headers $clientHeaders -Body $acceptBody -ContentType "application/json" } 403 "RBAC client no puede accept"

# Test 10: PROVIDER intenta cancelar -> 403
Write-Host "`nTest 10: PROVIDER intenta cancelar (espera 403)" -ForegroundColor Yellow
Assert-Status { Invoke-RestMethod -Uri "$baseUrl/api/requests/$requestId" -Method PATCH -Headers $providerHeaders -Body $cancelBody -ContentType "application/json" } 403 "RBAC provider no puede cancel"

# Test 11: Provider inválido -> 404
Write-Host "`nTest 11: Provider inválido (espera 404)" -ForegroundColor Yellow
$invalidProviderBody = @{
  providerId  = "00000000-0000-0000-0000-000000000000"
  title       = "Invalid provider"
  description = "x"
  location    = "CABA"
  urgency     = "LOW"
} | ConvertTo-Json
Assert-Status { Invoke-RestMethod -Uri "$baseUrl/api/requests" -Method POST -Headers $clientHeaders -Body $invalidProviderBody -ContentType "application/json" } 404 "Provider inválido"

# Test 12: Sin auth -> 401
Write-Host "`nTest 12: Sin auth (espera 401)" -ForegroundColor Yellow
Assert-Status { Invoke-RestMethod -Uri "$baseUrl/api/requests?as=client" -Method GET } 401 "Sin token"

# Test 13: Query as inválido -> 400
Write-Host "`nTest 13: Query as inválido (espera 400)" -ForegroundColor Yellow
Assert-Status { Invoke-RestMethod -Uri "$baseUrl/api/requests?as=admin" -Method GET -Headers $clientHeaders } 400 "as inválido"

Write-Host "`n✨ Tests completados" -ForegroundColor Cyan
