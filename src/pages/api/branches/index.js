import { validateSession } from '@/config/api-validation';
import { getBranches } from '@/prisma/services/branch';

// Performance logging
const logTime = (label, start) => {
    const duration = Date.now() - start;
    console.log(`[PERF] ${label}: ${duration}ms`);
    return duration;
};

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        const totalStart = Date.now();
        try {
            // 1. Validar sessão
            const sessionStart = Date.now();
            const session = await validateSession(req, res);
            logTime('validateSession', sessionStart);
            if (!session) return;

            // 2. Buscar branches
            const queryStart = Date.now();
            const branches = await getBranches(
                session.user.userId,
                session.user.email
            );
            logTime('getBranches query', queryStart);

            // 3. Total
            logTime('TOTAL /api/branches', totalStart);
            console.log(`[PERF] Branches encontradas: ${branches?.length || 0}`);

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
