import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { updateMemberRole } from '@/prisma/services/membership';

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
            await updateMemberRole(memberId);
            res.status(200).json({ data: { updated: true } });
        } catch (error) {
            console.error('Erro ao atualizar função:', error);
            res.status(500).json({
                errors: { role: { msg: error.message || 'Erro ao atualizar função' } }
            });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
