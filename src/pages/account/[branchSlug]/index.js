import { useEffect } from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { getSession } from 'next-auth/react';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import Card from '@/components/Card/index';
import { AccountLayout } from '@/layouts/index';
import { useBranch } from '@/providers/branch';
import { getBranch } from '@/prisma/services/branch';

const BranchDashboard = ({ branch: branchData }) => {
  const { branch, setBranch } = useBranch();

  useEffect(() => {
    if (branchData) {
      setBranch(branchData);
    }
  }, [branchData, setBranch]);

  const currentBranch = branch || branchData;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.painelswim.com';
  const branchUrl = `${appUrl.replace('app.', '')}/${currentBranch?.slug}`;
  const subdomainUrl = `https://${currentBranch?.slug}.painelswim.com`;

  const copyToClipboard = () => toast.success('Link copiado!');

  if (!currentBranch) return null;

  return (
    <AccountLayout>
      <Meta title={`Painel Swim - ${currentBranch?.name || 'Academia'}`} />
      <Content.Title
        title={currentBranch?.name || 'Academia'}
        subtitle="Painel de gerenciamento da academia"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Link de Acesso */}
          <Card>
            <Card.Body
              title="Link de Acesso da Academia"
              subtitle="Compartilhe este link com a academia para que ela acesse o sistema"
            >
              <div className="flex items-center justify-between px-3 py-2 mt-2 space-x-3 font-mono text-sm bg-gray-100 border rounded">
                <span className="overflow-x-auto text-blue-600">{subdomainUrl}</span>
                <CopyToClipboard onCopy={copyToClipboard} text={subdomainUrl}>
                  <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600 flex-shrink-0" />
                </CopyToClipboard>
              </div>
            </Card.Body>
          </Card>

          {/* Código da Academia */}
          <Card>
            <Card.Body
              title="Código da Academia"
              subtitle="Código único para identificação"
            >
              <div className="flex items-center justify-between px-3 py-2 mt-2 space-x-3 font-mono text-sm bg-gray-100 border rounded">
                <span className="overflow-x-auto">{currentBranch?.branchCode}</span>
                <CopyToClipboard onCopy={copyToClipboard} text={currentBranch?.branchCode}>
                  <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600 flex-shrink-0" />
                </CopyToClipboard>
              </div>
            </Card.Body>
          </Card>

          {/* Status */}
          <Card>
            <Card.Body
              title="Status"
              subtitle="Status atual da academia"
            >
              <div className="mt-2">
                <span className={`px-3 py-1 text-sm rounded-full ${currentBranch?.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : currentBranch?.status === 'INACTIVE'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {currentBranch?.status === 'ACTIVE' ? 'Ativa' :
                    currentBranch?.status === 'INACTIVE' ? 'Inativa' : 'Suspensa'}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Informações */}
          <Card>
            <Card.Body
              title="Informações"
              subtitle="Dados cadastrais da academia"
            >
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {currentBranch?.city && (
                  <p><strong>Cidade:</strong> {currentBranch.city} - {currentBranch.state}</p>
                )}
                {currentBranch?.telephone && (
                  <p><strong>Telefone:</strong> {currentBranch.telephone}</p>
                )}
                {currentBranch?.email && (
                  <p><strong>Email:</strong> {currentBranch.email}</p>
                )}
                {!currentBranch?.city && !currentBranch?.telephone && !currentBranch?.email && (
                  <p className="text-gray-400">Nenhuma informação cadastrada</p>
                )}
              </div>
            </Card.Body>
            <Card.Footer>
              <a href={`/account/${currentBranch?.slug}/settings/general`} className="text-blue-600">
                Editar informações &rarr;
              </a>
            </Card.Footer>
          </Card>
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let branch = null;

  if (session) {
    branch = await getBranch(
      session.user.userId,
      session.user.email,
      context.params.branchSlug
    );
  }

  return {
    props: {
      branch,
    },
  };
};

export default BranchDashboard;
