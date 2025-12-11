import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Meta from '@/components/Meta/index';
import { useInvitations, useBranches } from '@/hooks/data/index';
import { AdminHorizontalLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { useBranch } from '@/providers/branch';

const Welcome = () => {
  const router = useRouter();
  const { data: invitationsData, isLoading: isFetchingInvitations } =
    useInvitations();
  const { data: branchesData, isLoading: isFetchingBranches } =
    useBranches();
  const { setBranch } = useBranch();
  const [isSubmitting, setSubmittingState] = useState(false);

  const accept = (memberId) => {
    setSubmittingState(true);
    api(`/api/branch/team/accept`, {
      body: { memberId },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Convite aceito!');
      }
    });
  };

  const decline = (memberId) => {
    setSubmittingState(true);
    api(`/api/branch/team/decline`, {
      body: { memberId },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Convite recusado!');
      }
    });
  };

  const navigate = (branch) => {
    setBranch(branch);
    router.replace(`/account/${branch.slug}`);
  };

  return (
    <AdminHorizontalLayout title="Painel Swim" subtitle="Gerencie suas academias de natação">
      <Meta title="Painel Swim - Dashboard" />
      <div className="space-y-8">
        {/* Seção de Academias */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Minhas Academias</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {isFetchingBranches ? (
              <Card>
                <Card.Body />
                <Card.Footer />
              </Card>
            ) : branchesData?.branches?.length > 0 ? (
              branchesData.branches.map((branch, index) => (
                <Card key={index}>
                  <Card.Body
                    title={branch.name}
                    subtitle={branch.city ? `${branch.city} - ${branch.state}` : 'Sem localização'}
                  />
                  <Card.Footer>
                    <button
                      className="text-blue-600"
                      onClick={() => navigate(branch)}
                    >
                      Acessar academia &rarr;
                    </button>
                  </Card.Footer>
                </Card>
              ))
            ) : (
              <Card.Empty>Comece criando uma academia agora</Card.Empty>
            )}
          </div>
        </div>

        {/* Seção de Convites */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Convites Recebidos</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {isFetchingInvitations ? (
              <Card>
                <Card.Body />
                <Card.Footer />
              </Card>
            ) : invitationsData?.invitations?.length > 0 ? (
              invitationsData.invitations.map((invitation, index) => (
                <Card key={index}>
                  <Card.Body
                    title={invitation.branch?.name || 'Academia'}
                    subtitle={`Convidado por ${invitation.invitedBy?.name || invitation.invitedBy?.email || 'Desconhecido'}`}
                  />
                  <Card.Footer>
                    <Button
                      className="text-white bg-blue-600 hover:bg-blue-500"
                      disabled={isSubmitting}
                      onClick={() => accept(invitation.id)}
                    >
                      Aceitar
                    </Button>
                    <Button
                      className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white"
                      disabled={isSubmitting}
                      onClick={() => decline(invitation.id)}
                    >
                      Recusar
                    </Button>
                  </Card.Footer>
                </Card>
              ))
            ) : (
              <Card.Empty>
                Você ainda não recebeu convites para nenhuma academia.
              </Card.Empty>
            )}
          </div>
        </div>
      </div>
    </AdminHorizontalLayout>
  );
};

export default Welcome;
