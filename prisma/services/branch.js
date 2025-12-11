import { InvitationStatus, TeamRole } from '@prisma/client';
import slugify from 'slugify';

import prisma from '@/prisma/index';

export const countBranches = async (slug) =>
    await prisma.branch.count({
        where: { slug: { startsWith: slug } },
    });

// Dias de trial gratuito
const TRIAL_DAYS = 14;

// Gera o próximo idBranch sequencial
const getNextIdBranch = async () => {
    const lastBranch = await prisma.branch.findFirst({
        where: { idBranch: { not: null } },
        orderBy: { idBranch: 'desc' },
        select: { idBranch: true },
    });
    return (lastBranch?.idBranch || 0) + 1;
};

export const createBranch = async (creatorId, email, name, slug, data = {}) => {
    const count = await countBranches(slug);

    if (count > 0) {
        slug = `${slug}-${count}`;
    }

    // Calcula data de fim do trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    // Gera idBranch sequencial
    const idBranch = await getNextIdBranch();

    const branch = await prisma.branch.create({
        data: {
            creatorId,
            members: {
                create: {
                    email,
                    inviter: email,
                    status: InvitationStatus.ACCEPTED,
                    teamRole: TeamRole.OWNER,
                },
            },
            name,
            slug,
            idBranch,
            subscriptionStatus: 'TRIAL',
            trialEndsAt,
            ...data,
        },
    });

    return branch;
};

export const deleteBranch = async (id, email, slug) => {
    const branch = await getOwnBranch(id, email, slug);

    if (branch) {
        await prisma.branch.update({
            data: { deletedAt: new Date() },
            where: { id: branch.id },
        });
        return slug;
    } else {
        throw new Error('Unable to find branch');
    }
};

export const getInvitation = async (inviteCode) =>
    await prisma.branch.findFirst({
        select: {
            id: true,
            name: true,
            branchCode: true,
            slug: true,
        },
        where: {
            deletedAt: null,
            inviteCode,
        },
    });

export const getOwnBranch = async (id, email, slug) =>
    await prisma.branch.findFirst({
        select: {
            id: true,
            inviteCode: true,
            name: true,
        },
        where: {
            OR: [
                { id },
                {
                    members: {
                        some: {
                            deletedAt: null,
                            teamRole: TeamRole.OWNER,
                            email,
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

export const getSiteBranch = async (slug, customDomain) =>
    await prisma.branch.findFirst({
        select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            telephone: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            domains: { select: { name: true } },
        },
        where: {
            OR: [
                { slug },
                customDomain
                    ? {
                        domains: {
                            some: {
                                name: slug,
                                deletedAt: null,
                            },
                        },
                    }
                    : undefined,
            ],
            AND: { deletedAt: null },
        },
    });

export const getBranch = async (id, email, slug) =>
    await prisma.branch.findFirst({
        select: {
            id: true,
            creatorId: true,
            name: true,
            inviteCode: true,
            slug: true,
            branchCode: true,
            idBranch: true,
            internalName: true,
            cnpj: true,
            address: true,
            neighborhood: true,
            number: true,
            complement: true,
            city: true,
            state: true,
            stateShort: true,
            zipCode: true,
            telephone: true,
            whatsapp: true,
            email: true,
            website: true,
            latitude: true,
            longitude: true,
            openingDate: true,
            logoUrl: true,
            status: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
            createdAt: true,
            creator: { select: { email: true } },
            members: {
                select: {
                    email: true,
                    teamRole: true,
                },
            },
        },
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

export const getBranches = async (id, email) =>
    await prisma.branch.findMany({
        select: {
            createdAt: true,
            creator: {
                select: {
                    email: true,
                    name: true,
                },
            },
            inviteCode: true,
            members: {
                select: {
                    member: {
                        select: {
                            email: true,
                            image: true,
                            name: true,
                        },
                    },
                    joinedAt: true,
                    status: true,
                    teamRole: true,
                },
            },
            name: true,
            slug: true,
            branchCode: true,
            city: true,
            state: true,
            status: true,
            logoUrl: true,
        },
        where: {
            OR: [
                { id },
                {
                    members: {
                        some: {
                            email,
                            deletedAt: null,
                            status: InvitationStatus.ACCEPTED,
                        },
                    },
                },
            ],
            AND: { deletedAt: null },
        },
    });

export const getBranchPaths = async () => {
    const [branches, domains] = await Promise.all([
        prisma.branch.findMany({
            select: { slug: true },
            where: { deletedAt: null },
        }),
        prisma.domain.findMany({
            select: { name: true },
            where: { deletedAt: null },
        }),
    ]);
    return [
        ...branches.map((branch) => ({
            params: { site: branch.slug },
        })),
        ...domains.map((domain) => ({
            params: { site: domain.name },
        })),
    ];
};

export const inviteUsers = async (id, email, members, slug) => {
    const branch = await getOwnBranch(id, email, slug);
    const inviter = email;

    if (branch) {
        const membersList = members.map(({ email, role }) => ({
            email,
            inviter,
            teamRole: role,
        }));
        const data = members.map(({ email }) => ({
            createdAt: null,
            email,
        }));
        await Promise.all([
            prisma.user.createMany({
                data,
                skipDuplicates: true,
            }),
            prisma.branch.update({
                data: {
                    members: {
                        createMany: {
                            data: membersList,
                            skipDuplicates: true,
                        },
                    },
                },
                where: { id: branch.id },
            }),
        ]);
        return membersList;
    } else {
        throw new Error('Unable to find branch');
    }
};

export const isBranchCreator = (id, creatorId) => id === creatorId;

export const isBranchOwner = (email, branch) => {
    let isTeamOwner = false;
    const member = branch.members.find(
        (member) => member.email === email && member.teamRole === TeamRole.OWNER
    );

    if (member) {
        isTeamOwner = true;
    }

    return isTeamOwner;
};

export const joinBranch = async (branchCode, email) => {
    const branch = await prisma.branch.findFirst({
        select: {
            creatorId: true,
            id: true,
        },
        where: {
            deletedAt: null,
            branchCode,
        },
    });

    if (branch) {
        await prisma.member.upsert({
            create: {
                branchId: branch.id,
                email,
                inviter: branch.creatorId,
                status: InvitationStatus.ACCEPTED,
            },
            update: {},
            where: { email },
        });
        return new Date();
    } else {
        throw new Error('Unable to find branch');
    }
};

export const updateName = async (id, email, name, slug) => {
    const branch = await getOwnBranch(id, email, slug);

    if (branch) {
        await prisma.branch.update({
            data: { name },
            where: { id: branch.id },
        });
        return name;
    } else {
        throw new Error('Unable to find branch');
    }
};

export const updateSlug = async (id, email, newSlug, pathSlug) => {
    let slug = slugify(newSlug.toLowerCase());
    const count = await countBranches(slug);

    if (count > 0) {
        slug = `${slug}-${count}`;
    }

    const branch = await getOwnBranch(id, email, pathSlug);

    if (branch) {
        await prisma.branch.update({
            data: { slug },
            where: { id: branch.id },
        });
        return slug;
    } else {
        throw new Error('Unable to find branch');
    }
};

export const updateBranch = async (id, email, slug, data) => {
    const branch = await getOwnBranch(id, email, slug);

    if (branch) {
        await prisma.branch.update({
            data,
            where: { id: branch.id },
        });
        return branch;
    } else {
        throw new Error('Unable to find branch');
    }
};
