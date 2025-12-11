import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { checkDomain } from '@/prisma/services/domain';

const handler = async (req, res) => {
    const { method } = req;
    const { domain } = req.query;

    if (method === 'GET') {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        if (!domain) {
            return res.status(400).json({ error: 'Domínio é obrigatório' });
        }

        try {
            const result = await checkDomain(domain);
            res.status(200).json({ data: result });
        } catch (error) {
            console.error('Erro ao verificar domínio:', error);
            res.status(500).json({ error: 'Erro ao verificar domínio' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
