import { PrismaClient, Role, Urgency, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords (bcrypt)
  const clientPassword = await bcrypt.hash('cliente123', 10);
  const providerPassword = await bcrypt.hash('vicente', 10);
  const plomeroPassword = await bcrypt.hash('plomero123', 10);

  // A) Cliente Demo
  const clienteDemo = await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: {
      email: 'cliente@demo.com',
      passwordHash: clientPassword,
      name: 'Cliente Demo',
      phone: '+54 11 1234-5678',
      role: Role.CLIENT,
    },
  });
  console.log('✅ Cliente demo created:', clienteDemo.email);

  // B) Prestador Demo
  const vicenteDemo = await prisma.user.upsert({
    where: { email: 'vicen@demo.com' },
    update: {},
    create: {
      email: 'vicen@demo.com',
      passwordHash: providerPassword,
      name: 'Vicente Demo',
      phone: '+54 11 8765-4321',
      role: Role.PROVIDER,
    },
  });
  console.log('✅ Prestador demo created:', vicenteDemo.email);

  // C) ProviderProfile para Vicente
  const vicenteProfile = await prisma.providerProfile.upsert({
    where: { userId: vicenteDemo.id },
    update: {},
    create: {
      userId: vicenteDemo.id,
      zona: 'CABA',
      servicios: ['Electricista', 'Instalaciones', 'Reparaciones'],
      experiencia: 15,
      descripcion: 'Electricista matriculado con más de 15 años de experiencia en CABA y GBA. Especializado en instalaciones residenciales y comerciales, reparaciones de emergencia, tableros eléctricos, iluminación LED, y certificaciones reglamentarias. Atención personalizada y presupuestos sin cargo.',
      telefono: '+54 11 8765-4321',
    },
  });
  console.log('✅ ProviderProfile created for Vicente');

  // D) Plomeros en Palermo
  const plomero1 = await prisma.user.upsert({
    where: { email: 'mario.plomero@demo.com' },
    update: {},
    create: {
      email: 'mario.plomero@demo.com',
      passwordHash: plomeroPassword,
      name: 'Mario Pérez',
      phone: '+54 11 4567-8901',
      role: Role.PROVIDER,
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: plomero1.id },
    update: {},
    create: {
      userId: plomero1.id,
      zona: 'Palermo',
      servicios: ['Plomero', 'Destapaciones', 'Instalaciones'],
      experiencia: 12,
      descripcion: 'Plomero matriculado con 12 años de experiencia en Palermo. Especializado en destapaciones, reparación de pérdidas, instalación de termotanques y grifería. Servicio de emergencia 24/7. Presupuestos sin cargo.',
      telefono: '+54 11 4567-8901',
    },
  });
  console.log('✅ Plomero 1 created: mario.plomero@demo.com');

  const plomero2 = await prisma.user.upsert({
    where: { email: 'carlos.plomero@demo.com' },
    update: {},
    create: {
      email: 'carlos.plomero@demo.com',
      passwordHash: plomeroPassword,
      name: 'Carlos Rodríguez',
      phone: '+54 11 5678-9012',
      role: Role.PROVIDER,
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: plomero2.id },
    update: {},
    create: {
      userId: plomero2.id,
      zona: 'Palermo',
      servicios: ['Plomero', 'Gasista', 'Termotanques'],
      experiencia: 18,
      descripcion: 'Plomero y gasista matriculado en Palermo. 18 años de experiencia en instalaciones de gas, termotanques, calderas, y sistemas de calefacción. También plomería general y cloacas. Certificaciones y habilitaciones al día.',
      telefono: '+54 11 5678-9012',
    },
  });
  console.log('✅ Plomero 2 created: carlos.plomero@demo.com');

  const plomero3 = await prisma.user.upsert({
    where: { email: 'jorge.plomero@demo.com' },
    update: {},
    create: {
      email: 'jorge.plomero@demo.com',
      passwordHash: plomeroPassword,
      name: 'Jorge Fernández',
      phone: '+54 11 6789-0123',
      role: Role.PROVIDER,
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: plomero3.id },
    update: {},
    create: {
      userId: plomero3.id,
      zona: 'Palermo',
      servicios: ['Plomero', 'Reparaciones', 'Mantenimiento'],
      experiencia: 8,
      descripcion: 'Plomero en Palermo con 8 años de experiencia. Especializado en reparaciones urgentes, cambio de cañerías, arreglo de grifos y monocomandas, instalación de piletas y bachas. Trabajo prolijo y garantizado.',
      telefono: '+54 11 6789-0123',
    },
  });
  console.log('✅ Plomero 3 created: jorge.plomero@demo.com');

  // E) ServiceRequests de prueba
  
  // Request 1: PENDING (recién creada)
  await prisma.serviceRequest.upsert({
    where: { id: 'seed-request-1' },
    update: {},
    create: {
      id: 'seed-request-1',
      clientId: clienteDemo.id,
      providerId: vicenteProfile.userId,
      title: 'Instalación de tomas nuevas en cocina',
      description: 'Necesito instalar 3 tomacorrientes nuevos en la cocina para electrodomésticos. La cocina fue remodelada recientemente.',
      location: 'Palermo, CABA',
      urgency: Urgency.MEDIUM,
      status: RequestStatus.PENDING,
      budget: 8500,
      scheduledAt: new Date('2026-01-25T10:00:00'),
    },
  });

  // Request 2: ACCEPTED (Vicente ya aceptó)
  await prisma.serviceRequest.upsert({
    where: { id: 'seed-request-2' },
    update: {},
    create: {
      id: 'seed-request-2',
      clientId: clienteDemo.id,
      providerId: vicenteProfile.userId,
      title: 'Reparación de cortocircuito en living',
      description: 'Hay un cortocircuito que hace saltar la térmica cada vez que enciendo las luces del living. Urgente.',
      location: 'Recoleta, CABA',
      urgency: Urgency.HIGH,
      status: RequestStatus.ACCEPTED,
      budget: 12000,
      scheduledAt: new Date('2026-01-22T14:30:00'),
    },
  });

  // Request 3: CANCELLED (el cliente canceló)
  await prisma.serviceRequest.upsert({
    where: { id: 'seed-request-3' },
    update: {},
    create: {
      id: 'seed-request-3',
      clientId: clienteDemo.id,
      providerId: vicenteProfile.userId,
      title: 'Cambio de luminarias en dormitorio',
      description: 'Quiero cambiar 2 apliques viejos por luces LED modernas.',
      location: 'Belgrano, CABA',
      urgency: Urgency.LOW,
      status: RequestStatus.CANCELLED,
      budget: 5000,
    },
  });

  console.log('✅ ServiceRequests created (3)');
  console.log('\n📋 Seed Summary:');
  console.log('─────────────────────────────────────');
  console.log('👤 Cliente: cliente@demo.com / cliente123');
  console.log('🔧 Prestador: vicen@demo.com / vicente');
  console.log('📍 Zona: CABA');
  console.log('⚡ Servicio: Electricista');
  console.log('📝 Requests: 3 (PENDING, ACCEPTED, CANCELLED)');
  console.log('');
  console.log('🔧 Plomeros en Palermo:');
  console.log('   • mario.plomero@demo.com / plomero123');
  console.log('   • carlos.plomero@demo.com / plomero123');
  console.log('   • jorge.plomero@demo.com / plomero123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
