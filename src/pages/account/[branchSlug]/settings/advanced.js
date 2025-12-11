import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Meta from '@/components/Meta/index';
import Modal from '@/components/Modal/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { useBranch } from '@/providers/branch';
import { getSession } from 'next-auth/react';
import { getBranch, isBranchCreator } from '@/prisma/services/branch';

const Advanced = ({ isCreator }) => {
  const { setBranch, branch } = useBranch();
  const router = useRouter();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showModal, setModalState] = useState(false);
  const [verifyBranch, setVerifyBranch] = useState('');
  const verifiedBranch = verifyBranch === branch?.slug;

  const handleVerifyBranchChange = (event) =>
    setVerifyBranch(event.target.value);

  const deleteBranch = () => {
    setSubmittingState(true);
    api(`/api/branch/${branch.slug}`, {
      method: 'DELETE',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toggleModal();
        setBranch(null);
        router.replace('/account');
        toast.success('Academia excluída com sucesso!');
      }
    });
  };

  const toggleModal = () => {
    setVerifyBranch('');
    setModalState(!showModal);
  };

  return (
    <AccountLayout>
      <Meta title={`Painel Swim - ${branch?.name} | Configurações Avançadas`} />
      <Content.Title
        title="Configurações Avançadas"
        subtitle="Gerencie as configurações da academia"
      />
      <Content.Divider />
      <Content.Container>
        <Card danger>
          <Card.Body
            title="Excluir Academia"
            subtitle="A academia será excluída permanentemente, incluindo todo o conteúdo. Esta ação é irreversível."
          />
          <Card.Footer>
            <small className={[isCreator && 'text-red-600']}>
              {isCreator
                ? 'Esta ação não pode ser desfeita. Por favor, tenha certeza.'
                : 'Entre em contato com o criador da academia para excluí-la.'}
            </small>
            {isCreator && (
              <Button
                className="text-white bg-red-600 hover:bg-red-500"
                disabled={isSubmitting}
                onClick={toggleModal}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </Button>
            )}
          </Card.Footer>
          <Modal
            show={showModal}
            title="Excluir Academia"
            toggle={toggleModal}
          >
            <p className="flex flex-col">
              <span>
                Sua academia será excluída, junto com todo o seu conteúdo.
              </span>
              <span>
                Os dados associados a esta academia não poderão ser acessados pelos membros da equipe.
              </span>
            </p>
            <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. Por favor, tenha certeza.
            </p>
            <div className="flex flex-col">
              <label className="text-sm text-gray-400">
                Digite <strong>{branch?.slug}</strong> para continuar:
              </label>
              <input
                className="px-3 py-2 border rounded"
                disabled={isSubmitting}
                onChange={handleVerifyBranchChange}
                type="text"
                value={verifyBranch}
              />
            </div>
            <div className="flex flex-col items-stretch">
              <Button
                className="text-white bg-red-600 hover:bg-red-500"
                disabled={!verifiedBranch || isSubmitting}
                onClick={deleteBranch}
              >
                <span>Excluir Academia</span>
              </Button>
            </div>
          </Modal>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let isCreator = false;

  if (session) {
    const branch = await getBranch(
      session.user.userId,
      session.user.email,
      context.params.branchSlug
    );
    if (branch) {
      isCreator = isBranchCreator(session.user.userId, branch.creatorId);
    }
  }

  return { props: { isCreator } };
};

export default Advanced;
