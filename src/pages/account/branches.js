import Image from 'next/image';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta';
import { useBranches } from '@/hooks/data';
import { AdminHorizontalLayout } from '@/layouts/index';
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

const AcademiasPage = () => {
    const router = useRouter();
    const { setBranch } = useBranch();
    const { data, isLoading } = useBranches();
    const branches = data?.branches || [];

    const handleAccess = (branch) => {
        setBranch(branch);
        router.push(`/account/${branch.slug}`);
    };

    return (
        <AdminHorizontalLayout title="Painel Swim" subtitle="Gerencie suas academias de natação">
            <Meta title="Painel Swim - Academias" />
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h4 className="card-title">Academias</h4>
                                    <p className="card-title-desc mb-0 text-muted">
                                        Visualize todas as academias vinculadas à sua conta.
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-5 text-muted">Carregando academias...</div>
                            ) : branches.length === 0 ? (
                                <div className="text-center py-5 text-muted">Nenhuma academia encontrada.</div>
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
                                                            Ver academia
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

export default AcademiasPage;
