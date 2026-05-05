import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLES } from "../src/config/roles";

const prisma = new PrismaClient();

function uniqueStrings(values: Iterable<string>) {
  return Array.from(new Set(Array.from(values).filter(Boolean)));
}

async function main() {
  const permissionNames = uniqueStrings(Object.values(PERMISSIONS));
  const roleNames = uniqueStrings(Object.values(ROLES));

  console.log("Upserting permissions...");
  // Upsert all permissions
  for (const permissionName of permissionNames) {
    await prisma.permission.upsert({
      where: { permissionName },
      create: { permissionName },
      update: {},
    });
  }

  console.log("Upserting roles...");
  // Upsert all roles
  for (const roleName of roleNames) {
    await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });
  }

  // 1. Ensure Roles have full permissions by default
  const allPerms = await prisma.permission.findMany({ select: { id: true } });
  
  const rolesToBootstrap = [ROLES.ADMIN, ROLES.USER];
  for (const rName of rolesToBootstrap) {
    const role = await prisma.role.findUnique({ where: { name: rName } });
    if (role) {
      await prisma.rolePermission.createMany({
        data: allPerms.map(p => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true
      });
    }
  }

  // 2. Create/Update Users
  const passwordHash = await bcrypt.hash("abcd123", 10);

  const usersToCreate = [
    { email: "admin@demo.com", name: "Admin User", role: ROLES.ADMIN, pbac: true },
    { email: "user@demo.com", name: "Regular User", role: ROLES.USER, pbac: false },
  ];

  for (const uData of usersToCreate) {
    console.log(`Setting up user: ${uData.email}`);
    const user = await prisma.user.upsert({
      where: { email: uData.email },
      update: {
        passwordHash, // reset password to abcd123
      },
      create: {
        email: uData.email,
        name: uData.name,
        passwordHash,
        status: true,
      },
    });

    const role = await prisma.role.findUnique({ where: { name: uData.role } });
    if (role) {
      await prisma.userRole.upsert({
        where: { userId: user.id },
        update: { roleId: role.id },
        create: { userId: user.id, roleId: role.id },
      });
    }

    // Give Admin all permissions in PBAC as requested
    if (uData.pbac) {
      console.log(`Assigning all permissions to ${uData.email} via PBAC...`);
      await prisma.userPermission.deleteMany({ where: { userId: user.id } });
      await prisma.userPermission.createMany({
        data: allPerms.map(p => ({ userId: user.id, permissionId: p.id })),
        skipDuplicates: true
      });
    }
  }

  const [userCount, roleCount, permissionCount] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.permission.count(),
  ]);

  console.log(
    `Seed complete. users=${userCount}, roles=${roleCount}, permissions=${permissionCount}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
