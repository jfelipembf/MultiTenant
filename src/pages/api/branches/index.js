import { validateSession } from '@/config/api-validation';
import { getBranches } from '@/prisma/services/branch';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        try {
            const session = await validateSession(req, res);
            if (!session) return;

            const branches = await getBranches(
                session.user.userId,
                session.user.email
            );
            res.status(200).json({ data: { branches } });
        } catch (error) {
            console.error('Erro ao buscar branches:', error);
            res.status(500).json({ errors: { error: { msg: error.message } } });
        }
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
