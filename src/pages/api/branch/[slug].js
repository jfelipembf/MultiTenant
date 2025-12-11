import { getServerSession } from 'next-auth/next';
import { getBranch, updateBranch } from '@/prisma/services/branch';
import { authOptions } from '../auth/[...nextauth]';

const handler = async (req, res) => {
    const { method } = req;
    const { slug } = req.query;

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    if (method === 'GET') {
        try {
            const branch = await getBranch(
                session.user.userId,
                session.user.email,
                slug
            );

            if (!branch) {
                return res.status(404).json({ error: 'Academia não encontrada' });
            }

            res.status(200).json({ data: { branch } });
        } catch (error) {
            console.error('Erro ao buscar branch:', error);
            res.status(500).json({ error: 'Erro ao buscar academia' });
        }
    } else if (method === 'PUT') {
        const {
            name,
            internalName,
            cnpj,
            address,
            neighborhood,
            number,
            complement,
            city,
            state,
            stateShort,
            zipCode,
            telephone,
            whatsapp,
            email,
            website,
            latitude,
            longitude,
            logoUrl,
        } = req.body;

        try {
            // Monta objeto apenas com campos que foram enviados
            // Nota: idBranch é gerado automaticamente e não pode ser editado
            const updateData = {};

            if (name !== undefined) updateData.name = name;
            if (internalName !== undefined) updateData.internalName = internalName;
            if (cnpj !== undefined) updateData.cnpj = cnpj;
            if (address !== undefined) updateData.address = address;
            if (neighborhood !== undefined) updateData.neighborhood = neighborhood;
            if (number !== undefined) updateData.number = number;
            if (complement !== undefined) updateData.complement = complement;
            if (city !== undefined) updateData.city = city;
            if (state !== undefined) updateData.state = state;
            if (stateShort !== undefined) updateData.stateShort = stateShort;
            if (zipCode !== undefined) updateData.zipCode = zipCode;
            if (telephone !== undefined) updateData.telephone = telephone;
            if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
            if (email !== undefined) updateData.email = email;
            if (website !== undefined) updateData.website = website;
            if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

            // Campos numéricos
            if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
            if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

            const branch = await updateBranch(
                session.user.userId,
                session.user.email,
                slug,
                updateData
            );

            res.status(200).json({
                data: { branch },
                message: 'Academia atualizada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar branch:', error);
            res.status(500).json({ error: 'Erro ao atualizar academia' });
        }
    } else {
        res.status(405).json({ error: `Método ${method} não suportado` });
    }
};

export default handler;
