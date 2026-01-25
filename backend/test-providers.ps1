# Test del endpoint GET /api/providers
# Ejecutar: .\test-providers.ps1

Write-Host "`n🧪 Testing GET /api/providers`n" -ForegroundColor Cyan

# Test 1: Listar todos los proveedores
Write-Host "Test 1: Listar todos los proveedores" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers" `
        -Method GET `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Total proveedores:" $response.Count
    foreach ($provider in $response) {
        Write-Host "  - $($provider.name) | Zona: $($provider.zona) | Servicios: $($provider.servicios -join ', ') | Exp: $($provider.experiencia) años"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 1 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Filtrar por zona
Write-Host "Test 2: Filtrar por zona 'Zona Norte'" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers?zona=Zona Norte" `
        -Method GET `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Proveedores en Zona Norte:" $response.Count
    foreach ($provider in $response) {
        Write-Host "  - $($provider.name) | Zona: $($provider.zona)"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 2 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Filtrar por servicio
Write-Host "Test 3: Filtrar por servicio 'Plomeria'" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers?servicio=Plomeria" `
        -Method GET `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Proveedores de Plomeria:" $response.Count
    foreach ($provider in $response) {
        Write-Host "  - $($provider.name) | Servicios: $($provider.servicios -join ', ')"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 3 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Filtrar por zona y servicio
Write-Host "Test 4: Filtrar por zona 'Zona Norte' y servicio 'Electricidad'" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers?zona=Zona Norte&servicio=Electricidad" `
        -Method GET `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Proveedores filtrados:" $response.Count
    foreach ($provider in $response) {
        Write-Host "  - $($provider.name) | Zona: $($provider.zona) | Servicios: $($provider.servicios -join ', ')"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 4 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Filtro que no coincide (debe devolver array vacío)
Write-Host "Test 5: Filtro sin coincidencias" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers?zona=ZonaInexistente" `
        -Method GET `
        -ContentType "application/json"

    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Proveedores encontrados:" $response.Count "(debe ser 0)"
    Write-Host ""
} catch {
    Write-Host "❌ Test 5 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Verificar estructura de respuesta
Write-Host "Test 6: Verificar estructura de respuesta" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers" `
        -Method GET `
        -ContentType "application/json"

    if ($response.Count -gt 0) {
        $provider = $response[0]
        $hasId = $null -ne $provider.id
        $hasName = $null -ne $provider.name
        $hasZona = $null -ne $provider.zona
        $hasServicios = $null -ne $provider.servicios
        $hasExperiencia = $null -ne $provider.experiencia

        if ($hasId -and $hasName -and $hasZona -and $hasServicios -and $hasExperiencia) {
            Write-Host "✅ Estructura correcta: id, name, zona, servicios, experiencia" -ForegroundColor Green
            Write-Host "Ejemplo: id=$($provider.id.Substring(0,8))..., name=$($provider.name), zona=$($provider.zona)"
        } else {
            Write-Host "❌ Estructura incorrecta" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  No hay proveedores para verificar estructura" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 6 failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Verificar ordenamiento por experiencia (desc)
Write-Host "Test 7: Verificar ordenamiento por experiencia (descendente)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/providers" `
        -Method GET `
        -ContentType "application/json"

    if ($response.Count -gt 1) {
        $sorted = $true
        for ($i = 0; $i -lt ($response.Count - 1); $i++) {
            if ($response[$i].experiencia -lt $response[$i + 1].experiencia) {
                $sorted = $false
                break
            }
        }

        if ($sorted) {
            Write-Host "✅ Proveedores ordenados por experiencia (mayor a menor)" -ForegroundColor Green
        } else {
            Write-Host "❌ Proveedores NO están ordenados correctamente" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Insuficientes proveedores para verificar ordenamiento" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Test 7 failed: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✨ Tests completados`n" -ForegroundColor Cyan
