import bcrypt from 'bcryptjs';
import prisma from '@/prisma/index';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { name, email, password } = req.body;

    // Validações
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
    }

    try {
        // Verifica se o email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Este email já está cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Cria o usuário
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: new Date(), // Considera verificado ao criar com senha
            },
        });

        // Cria conta de pagamento (FREE por padrão)
        await prisma.customerPayment.create({
            data: {
                customerId: user.id,
                email: user.email,
                paymentId: `free_${user.id}`,
            },
        });

        return res.status(201).json({
            message: 'Conta criada com sucesso',
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}
