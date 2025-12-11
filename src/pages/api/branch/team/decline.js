import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { declineInvitation } from '@/prisma/services/membership';

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
            await declineInvitation(memberId, session.user.email);
            res.status(200).json({ data: { declined: true } });
        } catch (error) {
            console.error('Erro ao recusar convite:', error);
            res.status(500).json({
                errors: { decline: { msg: error.message || 'Erro ao recusar convite' } }
            });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
