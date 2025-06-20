const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create owner with specified credentials
  const ownerPassword = await bcrypt.hash('tmorowner978', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'tmor@owner.com' },
    update: {},
    create: {
      email: 'tmor@owner.com',
      name: 'tmor',
      password: ownerPassword,
      role: Role.OWNER,
    },
  });

  console.log('Owner created successfully:', {
    id: owner.id,
    email: owner.email,
    name: owner.name,
    role: owner.role,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 