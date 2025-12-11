import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getMembers } from '@/prisma/services/membership';

const handler = async (req, res) => {
    const { method } = req;
    const { slug } = req.query;

    if (method === 'GET') {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        try {
            const members = await getMembers(slug);
            res.status(200).json({ data: { members } });
        } catch (error) {
            console.error('Erro ao buscar membros:', error);
            res.status(500).json({ error: 'Erro ao buscar membros' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
