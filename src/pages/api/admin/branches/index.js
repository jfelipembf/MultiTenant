import { getSession } from 'next-auth/react';
import { getAllBranchesWithSubscription } from '@/prisma/services/subscription';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        const session = await getSession({ req });

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        // Verificar se é admin
        if (session.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        try {
            const branches = await getAllBranchesWithSubscription();
            res.status(200).json({ data: { branches } });
        } catch (error) {
            console.error('Erro ao listar branches:', error);
            res.status(500).json({ error: 'Erro ao listar academias' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
