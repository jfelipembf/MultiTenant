import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { joinBranch } from '@/prisma/services/branch';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'POST') {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        const { branchCode } = req.body;

        if (!branchCode) {
            return res.status(400).json({
                errors: { branchCode: { msg: 'Código da academia é obrigatório' } }
            });
        }

        try {
            await joinBranch(branchCode, session.user.email);
            res.status(200).json({ data: { joined: true } });
        } catch (error) {
            console.error('Erro ao entrar na academia:', error);
            res.status(422).json({
                errors: { join: { msg: error.message || 'Erro ao entrar na academia' } }
            });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
