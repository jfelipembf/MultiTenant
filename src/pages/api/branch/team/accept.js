import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { acceptInvitation } from '@/prisma/services/membership';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'PUT') {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({
                errors: { memberId: { msg: 'ID do membro é obrigatório' } }
            });
        }

        try {
            await acceptInvitation(memberId, session.user.email);
            res.status(200).json({ data: { accepted: true } });
        } catch (error) {
            console.error('Erro ao aceitar convite:', error);
            res.status(500).json({
                errors: { accept: { msg: error.message || 'Erro ao aceitar convite' } }
            });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
