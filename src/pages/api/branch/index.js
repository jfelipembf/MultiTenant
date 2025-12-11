import slugify from 'slugify';

import { validateSession } from '@/config/api-validation/index';
import { createBranch } from '@/prisma/services/branch';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'POST') {
        try {
            const session = await validateSession(req, res);
            if (!session) return;

            const { name, cnpj, address, city, state, telephone, whatsapp, email } = req.body;

            if (!name) {
                return res.status(400).json({ errors: { name: { msg: 'Nome é obrigatório' } } });
            }

            let slug = slugify(name.toLowerCase());

            const branch = await createBranch(
                session.user.userId,
                session.user.email,
                name,
                slug,
                { cnpj, address, city, state, telephone, whatsapp, email }
            );

            res.status(200).json({ data: { name, slug, id: branch.id } });
        } catch (error) {
            console.error('Erro ao criar branch:', error);
            res.status(500).json({ errors: { error: { msg: error.message } } });
        }
    } else {
        res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
    }
};

export default handler;
