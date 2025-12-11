import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getDomains } from '@/prisma/services/domain';

const handler = async (req, res) => {
    const { method } = req;
    const { slug } = req.query;

    if (method === 'GET') {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        try {
            const domains = await getDomains(slug);
            res.status(200).json({ data: { domains } });
        } catch (error) {
            console.error('Erro ao buscar domínios:', error);
            res.status(500).json({ error: 'Erro ao buscar domínios' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
