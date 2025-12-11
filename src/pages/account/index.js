import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Meta from '@/components/Meta/index';
import { useInvitations, useBranches } from '@/hooks/data/index';
import { AdminHorizontalLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { useBranch } from '@/providers/branch';

const statusLabels = {
  TRIAL: 'Período de Teste',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento Pendente',
  SUSPENDED: 'Suspensa',
  CANCELLED: 'Cancelada',
};

const statusColors = {
  TRIAL: 'badge-soft-info',
  ACTIVE: 'badge-soft-success',
  PAST_DUE: 'badge-soft-warning',
  SUSPENDED: 'badge-soft-danger',
  CANCELLED: 'badge-soft-secondary',
};

const planLabels = {
  BASIC: 'Básico',
  PRO: 'Profissional',
  ENTERPRISE: 'Empresarial',
};

const getInitials = (name = 'Academia') => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const Dashboard = () => {
  const router = useRouter();
  const { data: invitationsData, isLoading: isFetchingInvitations } = useInvitations();
  const { data: branchesData, isLoading: isFetchingBranches } = useBranches();
  const { setBranch } = useBranch();
  const [isSubmitting, setSubmittingState] = useState(false);

  const branches = branchesData?.branches || [];
  const invitations = invitationsData?.invitations || [];

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

  const handleAccess = (branch) => {
    setBranch(branch);
    router.push(`/account/${branch.slug}`);
  };

  return (
    <AdminHorizontalLayout title="Painel Swim" subtitle="Gerencie suas academias de natação">
      <Meta title="Painel Swim - Dashboard" />

      {/* Seção de Convites (só aparece se tiver convites) */}
      {invitations.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-warning">
              <div className="card-body">
                <h4 className="card-title text-warning">
                  <i className="ti-bell me-2"></i>
                  Convites Pendentes ({invitations.length})
                </h4>
                <div className="row">
                  {invitations.map((invitation, index) => (
                    <div key={index} className="col-md-4 mb-3">
                      <div className="card border">
                        <div className="card-body">
                          <h5 className="card-title">{invitation.branch?.name || 'Academia'}</h5>
                          <p className="card-text text-muted small">
                            Convidado por {invitation.invitedBy?.name || invitation.invitedBy?.email || 'Desconhecido'}
                          </p>
                          <div className="d-flex gap-2">
                            <Button
                              className="btn btn-sm btn-primary"
                              disabled={isSubmitting}
                              onClick={() => accept(invitation.id)}
                            >
                              Aceitar
                            </Button>
                            <Button
                              className="btn btn-sm btn-outline-danger"
                              disabled={isSubmitting}
                              onClick={() => decline(invitation.id)}
                            >
                              Recusar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Academias */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="card-title">Minhas Academias</h4>
                  <p className="card-title-desc mb-0 text-muted">
                    Visualize todas as academias vinculadas à sua conta.
                  </p>
                </div>
              </div>

              {isFetchingBranches ? (
                <div className="text-center py-5 text-muted">Carregando academias...</div>
              ) : branches.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti-briefcase display-4 text-muted mb-3 d-block"></i>
                  <p className="text-muted">Nenhuma academia encontrada.</p>
                  <p className="text-muted small">Você será adicionado a uma academia quando receber um convite.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Academia</th>
                        <th>Localização</th>
                        <th>Status</th>
                        <th>Plano</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch) => (
                        <tr key={branch.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                {branch.logoUrl ? (
                                  <span className="avatar-title rounded-circle bg-light text-primary">
                                    <Image
                                      src={branch.logoUrl}
                                      alt={branch.name}
                                      width={40}
                                      height={40}
                                      className="img-fluid rounded-circle"
                                    />
                                  </span>
                                ) : (
                                  <span className="avatar-title rounded-circle bg-soft-primary text-primary fw-bold">
                                    {getInitials(branch.name)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h5 className="font-size-15 mb-0 text-dark">{branch.name}</h5>
                                <span className="text-muted small">{branch.email || branch.slug}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted">
                            {branch.city && branch.state
                              ? `${branch.city} - ${branch.state}`
                              : 'Sem localização'}
                          </td>
                          <td>
                            <span className={`badge ${statusColors[branch.subscriptionStatus] || 'badge-soft-secondary'}`}>
                              {statusLabels[branch.subscriptionStatus] || 'Desconhecido'}
                            </span>
                          </td>
                          <td className="text-muted">{planLabels[branch.subscriptionPlan] || '—'}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleAccess(branch)}
                            >
                              Acessar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminHorizontalLayout>
  );
};

export default Dashboard;
