import slugify from 'slugify';

import {
  validateCreateWorkspace,
  validateSession,
} from '@/config/api-validation/index';
import { createWorkspace } from '@/prisma/services/workspace';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    try {
      const session = await validateSession(req, res);
      if (!session) return; // validateSession já enviou a resposta de erro

      await validateCreateWorkspace(req, res);
      const { name } = req.body;
      let slug = slugify(name.toLowerCase());
      await createWorkspace(session.user.userId, session.user.email, name, slug);
      res.status(200).json({ data: { name, slug } });
    } catch (error) {
      console.error('Erro ao criar workspace:', error);
      res.status(500).json({ errors: { error: { msg: error.message } } });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
