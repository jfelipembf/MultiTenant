import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getPendingInvitations } from '@/prisma/services/membership';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        try {
            const invitations = await getPendingInvitations(session.user.email);
            res.status(200).json({ data: { invitations } });
        } catch (error) {
            console.error('Erro ao buscar convites:', error);
            res.status(500).json({ error: 'Erro ao buscar convites' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
