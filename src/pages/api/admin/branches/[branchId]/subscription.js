import { getSession } from 'next-auth/react';
import {
    activateSubscription,
    suspendBranch,
    releaseBranch,
    cancelSubscription,
    startTrial
} from '@/prisma/services/subscription';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
    const { method } = req;
    const { branchId } = req.query;

    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar se é admin
    if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    if (method === 'PUT') {
        const { action, plan } = req.body;

        try {
            let branch;

            switch (action) {
                case 'activate':
                    branch = await activateSubscription(branchId, plan || 'BASIC');
                    break;

                case 'suspend':
                    branch = await suspendBranch(branchId);
                    break;

                case 'release':
                    branch = await releaseBranch(branchId);
                    break;

                case 'cancel':
                    branch = await cancelSubscription(branchId);
                    break;

                case 'trial':
                    branch = await startTrial(branchId);
                    break;

                default:
                    return res.status(400).json({ error: 'Ação inválida' });
            }

            res.status(200).json({
                data: { branch },
                message: `Ação "${action}" executada com sucesso`
            });
        } catch (error) {
            console.error('Erro ao atualizar assinatura:', error);
            res.status(500).json({ error: 'Erro ao atualizar assinatura' });
        }
    } else if (method === 'GET') {
        // Retorna detalhes da assinatura da branch
        try {
            const branch = await prisma.branch.findUnique({
                where: { id: branchId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    email: true,
                    subscriptionStatus: true,
                    subscriptionPlan: true,
                    trialEndsAt: true,
                    subscriptionEndsAt: true,
                    lastPaymentAt: true,
                    stripeCustomerId: true,
                    stripeSubscriptionId: true,
                    paymentHistory: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });

            if (!branch) {
                return res.status(404).json({ error: 'Academia não encontrada' });
            }

            res.status(200).json({ data: { branch } });
        } catch (error) {
            console.error('Erro ao buscar branch:', error);
            res.status(500).json({ error: 'Erro ao buscar academia' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
