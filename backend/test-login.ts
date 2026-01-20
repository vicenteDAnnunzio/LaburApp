// Test del endpoint POST /auth/login
// Ejecutar: npx ts-node test-login.ts

const testLogin = async () => {
  const baseUrl = 'http://localhost:4000/api/auth';

  console.log('🧪 Testing POST /auth/login\n');

  // Test 1: Login exitoso con cliente
  console.log('Test 1: Login exitoso - Cliente');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cliente@demo.com',
        password: 'cliente123',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 1 passed\n');
  } catch (error: any) {
    console.error('❌ Test 1 failed:', error.message, '\n');
  }

  // Test 2: Login exitoso con prestador
  console.log('Test 2: Login exitoso - Prestador');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vicen@demo.com',
        password: 'vicente',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('✅ Test 2 passed\n');
  } catch (error: any) {
    console.error('❌ Test 2 failed:', error.message, '\n');
  }

  // Test 3: Email no existe
  console.log('Test 3: Email no existe (debe ser 401)');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'noexiste@demo.com',
        password: 'cualquiera',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Test 3 passed\n');
    } else {
      console.log('❌ Test 3 failed: Expected 401\n');
    }
  } catch (error: any) {
    console.error('❌ Test 3 failed:', error.message, '\n');
  }

  // Test 4: Password incorrecta
  console.log('Test 4: Password incorrecta (debe ser 401)');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cliente@demo.com',
        password: 'passwordincorrecta',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Test 4 passed\n');
    } else {
      console.log('❌ Test 4 failed: Expected 401\n');
    }
  } catch (error: any) {
    console.error('❌ Test 4 failed:', error.message, '\n');
  }

  // Test 5: Email inválido (validación Zod)
  console.log('Test 5: Email inválido (debe ser 400)');
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'emailinvalido',
        password: 'cualquiera',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400) {
      console.log('✅ Test 5 passed\n');
    } else {
      console.log('❌ Test 5 failed: Expected 400\n');
    }
  } catch (error: any) {
    console.error('❌ Test 5 failed:', error.message, '\n');
  }

  console.log('🏁 Tests completados');
};

testLogin();
