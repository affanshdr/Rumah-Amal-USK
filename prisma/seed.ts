import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@rumahamal.usk.ac.id';
  const password = 'Admin@RumahAmal2025';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('✅ Admin user already exists:', email);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email   :', admin.email);
  console.log('   Password:', password);
  console.log('   Role    :', admin.role);
  console.log('');
  console.log('⚠️  Segera ganti password setelah login pertama!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
