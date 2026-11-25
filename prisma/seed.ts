import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/database';

async function main(): Promise<void> {
  const adminRole = await prisma.institution_roles.upsert({
    where: { id: BigInt(1) },
    update: { name: 'Admin', status: 'Active' },
    create: {
      id: BigInt(1),
      name: 'Admin',
      status: 'Active',
      created_by: BigInt(1),
      updated_by: BigInt(1),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const staffRole = await prisma.institution_roles.upsert({
    where: { id: BigInt(2) },
    update: { name: 'Staff', status: 'Active' },
    create: {
      id: BigInt(2),
      name: 'Staff',
      status: 'Active',
      created_by: BigInt(1),
      updated_by: BigInt(1),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.institution_users.upsert({
    where: { email: 'admin@knovista.com' },
    update: {
      password: adminPasswordHash,
      status: 'Active',
      role_id: adminRole.id,
    },
    create: {
      role_id: adminRole.id,
      first_name: 'System',
      last_name: 'Admin',
      gender: 'Other',
      email: 'admin@knovista.com',
      username: 'admin',
      password: adminPasswordHash,
      mobile_no: '9999999999',
      status: 'Active',
      created_by: BigInt(1),
      updated_by: BigInt(1),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const staffPasswordHash = await bcrypt.hash('staff123', 10);
  await prisma.institution_users.upsert({
    where: { email: 'staff@knovista.com' },
    update: {
      password: staffPasswordHash,
      status: 'Active',
      role_id: staffRole.id,
    },
    create: {
      role_id: staffRole.id,
      first_name: 'Knovista',
      last_name: 'Staff',
      gender: 'Other',
      email: 'staff@knovista.com',
      username: 'staff',
      password: staffPasswordHash,
      mobile_no: '9888888888',
      status: 'Active',
      created_by: BigInt(1),
      updated_by: BigInt(1),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const studentPasswordHash = await bcrypt.hash('student123', 10);
  await prisma.students.upsert({
    where: { email: 'student@knovista.com' },
    update: {
      password: studentPasswordHash,
      status: 'Active',
      login_status: 'inactive',
    },
    create: {
      first_name: 'John',
      last_name: 'Doe',
      gender: 'Male',
      email: 'student@knovista.com',
      username: 'student1',
      password: studentPasswordHash,
      mobile_no: '9876543210',
      status: 'Active',
      login_status: 'inactive',
      created_by: BigInt(1),
      updated_by: BigInt(1),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(`${e}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

