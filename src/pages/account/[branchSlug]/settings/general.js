import { useEffect, useState } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isSlug from 'validator/lib/isSlug';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Meta from '@/components/Meta/index';
import { AdminHorizontalLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { useBranch } from '@/providers/branch';
import { getBranch, isBranchOwner } from '@/prisma/services/branch';

const General = ({ isTeamOwner, branch }) => {
  const router = useRouter();
  const { setBranch } = useBranch();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState(branch?.name || '');
  const [slug, setSlug] = useState(branch?.slug || '');
  const validName = name.length > 0 && name.length <= 50;
  const validSlug =
    slug.length > 0 &&
    slug.length <= 50 &&
    isSlug(slug) &&
    isAlphanumeric(slug, undefined, { ignore: '-' });

  const changeName = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api(`/api/branch/${branch.slug}/name`, {
      body: { name },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Nome atualizado com sucesso!');
      }
    });
  };

  const changeSlug = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api(`/api/branch/${branch.slug}/slug`, {
      body: { slug },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);
      const newSlug = response?.data?.slug;

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Slug atualizado com sucesso!');
        router.replace(`/account/${newSlug}/settings/general`);
      }
    });
  };

  const copyToClipboard = () => toast.success('Copiado!');

  const handleNameChange = (event) => setName(event.target.value);

  const handleSlugChange = (event) => setSlug(event.target.value);

  useEffect(() => {
    if (branch) {
      setName(branch.name);
      setSlug(branch.slug);
      setBranch(branch);
    }
  }, [branch, setBranch]);

  if (!branch) return null;

  return (
    <AdminHorizontalLayout title="Informações da Academia" subtitle="Gerencie os detalhes e informações da sua academia">
      <Meta title={`Painel Swim - ${branch.name} | Configurações`} />
      <div className="space-y-6">
        <Card>
          <Card.Body
            title="Nome da Academia"
            subtitle="Usado para identificar sua academia no painel"
          >
            <input
              className="px-3 py-2 border rounded md:w-1/2"
              disabled={isSubmitting || !isTeamOwner}
              onChange={handleNameChange}
              type="text"
              value={name}
            />
          </Card.Body>
          <Card.Footer>
            <small>Use no máximo 50 caracteres</small>
            {isTeamOwner && (
              <Button
                className="text-white bg-blue-600 hover:bg-blue-500"
                disabled={!validName || isSubmitting}
                onClick={changeName}
              >
                Salvar
              </Button>
            )}
          </Card.Footer>
        </Card>
        <Card>
          <Card.Body
            title="Slug da Academia"
            subtitle="Usado para identificar sua academia na URL"
          >
            <div className="flex items-center space-x-3">
              <input
                className="px-3 py-2 border rounded md:w-1/2"
                disabled={isSubmitting || !isTeamOwner}
                onChange={handleSlugChange}
                type="text"
                value={slug}
              />
              <span className={`text-sm ${slug.length > 50 && 'text-red-600'}`}>
                {slug.length} / 50
              </span>
            </div>
          </Card.Body>
          <Card.Footer>
            <small>
              Use apenas letras, números e hífens
            </small>
            {isTeamOwner && (
              <Button
                className="text-white bg-blue-600 hover:bg-blue-500"
                disabled={!validSlug || isSubmitting}
                onClick={changeSlug}
              >
                Salvar
              </Button>
            )}
          </Card.Footer>
        </Card>
        <Card>
          <Card.Body
            title="ID da Academia"
            subtitle="Usado para interações com APIs"
          >
            <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded md:w-1/2">
              <span className="overflow-x-auto">{branch.branchCode}</span>
              <CopyToClipboard
                onCopy={copyToClipboard}
                text={branch.branchCode}
              >
                <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </CopyToClipboard>
            </div>
          </Card.Body>
        </Card>
      </div>
    </AdminHorizontalLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let isTeamOwner = false;
  let branch = null;

  if (session) {
    branch = await getBranch(
      session.user.userId,
      session.user.email,
      context.params.branchSlug
    );

    if (branch) {
      isTeamOwner = isBranchOwner(session.user.email, branch);
    }
  }

  return {
    props: {
      isTeamOwner,
      branch,
    },
  };
};

export default General;
