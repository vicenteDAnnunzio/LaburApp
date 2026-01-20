import { PrismaClient, Role, Urgency, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords (bcrypt)
  const clientPassword = await bcrypt.hash('cliente123', 10);
  const providerPassword = await bcrypt.hash('vicente', 10);

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

  // D) ServiceRequests de prueba
  
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
