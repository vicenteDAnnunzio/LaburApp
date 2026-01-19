import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash para passwords de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear usuarios de ejemplo
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      password: hashedPassword,
      name: 'Juan Pérez',
      phone: '+1234567890',
      role: Role.CLIENT,
    },
  });

  const provider1 = await prisma.user.upsert({
    where: { email: 'provider1@example.com' },
    update: {},
    create: {
      email: 'provider1@example.com',
      password: hashedPassword,
      name: 'María García',
      phone: '+0987654321',
      role: Role.PROVIDER,
    },
  });

  // Crear perfil de proveedor
  await prisma.providerProfile.upsert({
    where: { userId: provider1.id },
    update: {},
    create: {
      userId: provider1.id,
      businessName: 'García Plumbing Services',
      serviceType: 'Plomería',
      description: 'Servicios de plomería profesional con 10 años de experiencia',
      location: 'Ciudad de México',
      availability: 'Lun-Vie 8:00-18:00',
      rating: 4.8,
      reviewCount: 24,
      isVerified: true,
    },
  });

  console.log('✅ Seed completed successfully');
  console.log('📧 Client: client1@example.com');
  console.log('📧 Provider: provider1@example.com');
  console.log('🔑 Password for all: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
