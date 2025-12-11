import { InvitationStatus, TeamRole } from '@prisma/client';
import prisma from '@/prisma/index';

export const getMember = async (id) =>
  await prisma.member.findFirst({
    select: { teamRole: true },
    where: { id },
  });

export const getMembers = async (slug) =>
  await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      status: true,
      teamRole: true,
      member: { select: { name: true } },
    },
    where: {
      deletedAt: null,
      branch: {
        deletedAt: null,
        slug,
      },
    },
  });

export const getPendingInvitations = async (email) =>
  await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      joinedAt: true,
      status: true,
      teamRole: true,
      invitedBy: {
        select: {
          email: true,
          name: true,
        },
      },
      branch: {
        select: {
          createdAt: true,
          inviteCode: true,
          name: true,
          slug: true,
          branchCode: true,
          creator: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
      email,
      status: InvitationStatus.PENDING,
      branch: { deletedAt: null },
    },
  });

export const removeMember = async (id) =>
  await prisma.member.update({
    data: { deletedAt: new Date() },
    where: { id },
  });

export const toggleRole = async (id, teamRole) =>
  await prisma.member.update({
    data: { teamRole },
    where: { id },
  });

export const updateMemberRole = async (id) => {
  const member = await getMember(id);
  const newRole = member.teamRole === TeamRole.MEMBER ? TeamRole.OWNER : TeamRole.MEMBER;
  return toggleRole(id, newRole);
};

export const updateStatus = async (id, status) =>
  await prisma.member.update({
    data: { status },
    where: { id },
  });

export const acceptInvitation = async (memberId, email) => {
  const member = await prisma.member.findFirst({
    where: { id: memberId, email, deletedAt: null },
  });

  if (!member) {
    throw new Error('Convite não encontrado');
  }

  return updateStatus(memberId, InvitationStatus.ACCEPTED);
};

export const declineInvitation = async (memberId, email) => {
  const member = await prisma.member.findFirst({
    where: { id: memberId, email, deletedAt: null },
  });

  if (!member) {
    throw new Error('Convite não encontrado');
  }

  return updateStatus(memberId, InvitationStatus.DECLINED);
};
