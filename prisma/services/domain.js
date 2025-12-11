import prisma from '@/prisma/index';

export const createDomain = async (
  id,
  email,
  slug,
  name,
  apexName,
  verified,
  verificationData
) => {
  let subdomain = null;
  let verificationValue = null;

  if (!verified) {
    const { domain, value } = verificationData[0];
    subdomain = domain.replace(`.${apexName}`, '');
    verificationValue = value;
  }

  const branch = await prisma.branch.findFirst({
    select: { id: true },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              email,
              deletedAt: null,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });
  await prisma.domain.create({
    data: {
      addedById: id,
      name,
      subdomain,
      value: verificationValue,
      verified,
      branchId: branch.id,
    },
  });
};

export const deleteDomain = async (id, email, slug, name) => {
  const branch = await prisma.branch.findFirst({
    select: { id: true },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              email,
              deletedAt: null,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });
  const domain = await prisma.domain.findFirst({
    select: { id: true },
    where: {
      deletedAt: null,
      name,
      branchId: branch.id,
    },
  });
  await prisma.domain.update({
    data: { deletedAt: new Date() },
    where: { id: domain.id },
  });
};

export const getDomains = async (slug) =>
  await prisma.domain.findMany({
    select: {
      name: true,
      subdomain: true,
      verified: true,
      value: true,
    },
    where: {
      deletedAt: null,
      branch: {
        deletedAt: null,
        slug,
      },
    },
  });

export const checkDomain = async (domainName) => {
  const domain = await prisma.domain.findFirst({
    select: {
      name: true,
      verified: true,
      subdomain: true,
      value: true,
    },
    where: {
      deletedAt: null,
      name: domainName,
    },
  });
  return domain || { verified: false };
};

export const verifyDomain = async (id, email, slug, name, verified) => {
  const branch = await prisma.branch.findFirst({
    select: { id: true },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              email,
              deletedAt: null,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });
  const domain = await prisma.domain.findFirst({
    select: { id: true },
    where: {
      deletedAt: null,
      name,
      branchId: branch.id,
    },
  });
  await prisma.domain.update({
    data: { verified },
    where: { id: domain.id },
  });
};
