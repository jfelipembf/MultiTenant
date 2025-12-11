import prisma from '@/prisma/index';
import stripe from '@/lib/server/stripe';

// Dias de trial gratuito
const TRIAL_DAYS = 14;

/**
 * Verifica se a branch tem acesso ao sistema
 */
export const hasAccess = (branch) => {
    if (!branch) return false;

    const { subscriptionStatus, trialEndsAt } = branch;

    // Status que permitem acesso
    const allowedStatuses = ['TRIAL', 'ACTIVE', 'PAST_DUE'];

    if (!allowedStatuses.includes(subscriptionStatus)) {
        return false;
    }

    // Se está em trial, verificar se ainda não expirou
    if (subscriptionStatus === 'TRIAL' && trialEndsAt) {
        return new Date() < new Date(trialEndsAt);
    }

    return true;
};

/**
 * Retorna mensagem de status da assinatura
 */
export const getSubscriptionMessage = (branch) => {
    if (!branch) return { status: 'error', message: 'Academia não encontrada' };

    const { subscriptionStatus, trialEndsAt, subscriptionEndsAt } = branch;

    switch (subscriptionStatus) {
        case 'TRIAL':
            const trialDaysLeft = trialEndsAt
                ? Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
                : 0;
            if (trialDaysLeft <= 0) {
                return { status: 'expired', message: 'Período de teste expirado. Assine para continuar.' };
            }
            return { status: 'trial', message: `${trialDaysLeft} dias restantes no período de teste` };

        case 'ACTIVE':
            return { status: 'active', message: 'Assinatura ativa' };

        case 'PAST_DUE':
            return { status: 'warning', message: 'Pagamento pendente. Regularize para evitar suspensão.' };

        case 'SUSPENDED':
            return { status: 'blocked', message: 'Acesso suspenso por falta de pagamento.' };

        case 'CANCELLED':
            return { status: 'cancelled', message: 'Assinatura cancelada.' };

        default:
            return { status: 'unknown', message: 'Status desconhecido' };
    }
};

/**
 * Inicia período de trial para uma branch
 */
export const startTrial = async (branchId) => {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    return await prisma.branch.update({
        where: { id: branchId },
        data: {
            subscriptionStatus: 'TRIAL',
            trialEndsAt,
        },
    });
};

/**
 * Ativa assinatura de uma branch (após pagamento)
 */
export const activateSubscription = async (branchId, plan = 'BASIC', stripeSubscriptionId = null) => {
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    return await prisma.branch.update({
        where: { id: branchId },
        data: {
            subscriptionStatus: 'ACTIVE',
            subscriptionPlan: plan,
            stripeSubscriptionId,
            subscriptionEndsAt,
            lastPaymentAt: new Date(),
        },
    });
};

/**
 * Suspende acesso de uma branch
 */
export const suspendBranch = async (branchId, reason = 'Falta de pagamento') => {
    return await prisma.branch.update({
        where: { id: branchId },
        data: {
            subscriptionStatus: 'SUSPENDED',
        },
    });
};

/**
 * Libera acesso de uma branch (manual pelo admin)
 */
export const releaseBranch = async (branchId) => {
    return await prisma.branch.update({
        where: { id: branchId },
        data: {
            subscriptionStatus: 'ACTIVE',
            lastPaymentAt: new Date(),
        },
    });
};

/**
 * Cancela assinatura de uma branch
 */
export const cancelSubscription = async (branchId) => {
    return await prisma.branch.update({
        where: { id: branchId },
        data: {
            subscriptionStatus: 'CANCELLED',
            stripeSubscriptionId: null,
        },
    });
};

/**
 * Registra pagamento no histórico
 */
export const recordPayment = async (branchId, paymentData) => {
    return await prisma.branchPaymentHistory.create({
        data: {
            branchId,
            stripePaymentId: paymentData.stripePaymentId,
            amount: paymentData.amount,
            currency: paymentData.currency || 'BRL',
            status: paymentData.status,
            description: paymentData.description,
        },
    });
};

/**
 * Lista branches com assinatura expirada ou em atraso
 */
export const getExpiredBranches = async () => {
    const now = new Date();

    return await prisma.branch.findMany({
        where: {
            OR: [
                // Trial expirado
                {
                    subscriptionStatus: 'TRIAL',
                    trialEndsAt: { lt: now },
                },
                // Assinatura vencida
                {
                    subscriptionStatus: 'ACTIVE',
                    subscriptionEndsAt: { lt: now },
                },
                // Em atraso
                {
                    subscriptionStatus: 'PAST_DUE',
                },
            ],
        },
        select: {
            id: true,
            name: true,
            email: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
        },
    });
};

/**
 * Atualiza status de branches com trial/assinatura expirada
 */
export const updateExpiredSubscriptions = async () => {
    const now = new Date();

    // Marca trials expirados como SUSPENDED
    await prisma.branch.updateMany({
        where: {
            subscriptionStatus: 'TRIAL',
            trialEndsAt: { lt: now },
        },
        data: {
            subscriptionStatus: 'SUSPENDED',
        },
    });

    // Marca assinaturas vencidas como PAST_DUE
    await prisma.branch.updateMany({
        where: {
            subscriptionStatus: 'ACTIVE',
            subscriptionEndsAt: { lt: now },
        },
        data: {
            subscriptionStatus: 'PAST_DUE',
        },
    });
};

/**
 * Lista todas as branches com info de assinatura (para admin)
 */
export const getAllBranchesWithSubscription = async () => {
    return await prisma.branch.findMany({
        where: {
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            telephone: true,
            status: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
            lastPaymentAt: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
