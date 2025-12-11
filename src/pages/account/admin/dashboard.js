import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardBody, Row, Col } from 'reactstrap';

import Meta from '@/components/Meta/index';
import { AdminHorizontalLayout } from '@/layouts/index';
import api from '@/lib/common/api';

// Miniwidget igual ao modelo do Dashboard
const Miniwidget = ({ reports }) => (
    <Row>
        {reports.map((report, key) => (
            <Col xl={3} sm={6} key={key}>
                <Card className="mini-stat bg-primary">
                    <CardBody className="card-body mini-stat-img">
                        <div className="mini-stat-icon">
                            <i className={`float-end mdi mdi-${report.iconClass}`}></i>
                        </div>
                        <div className="text-white">
                            <h6 className="text-uppercase mb-3 font-size-16 text-white">{report.title}</h6>
                            <h2 className="mb-4 text-white">{report.total}</h2>
                            <span className={`badge bg-${report.badgecolor || 'info'}`}> {report.average} </span>
                            <span className="ms-2">{report.subtitle || ''}</span>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        ))}
    </Row>
);

const AdminDashboard = ({ isAdmin }) => {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        trial: 0,
        suspended: 0,
        cancelled: 0,
        pastDue: 0,
    });
    const [recentBranches, setRecentBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            console.log('[Dashboard] Buscando dados...');
            const response = await api('/api/admin/branches');
            console.log('[Dashboard] Resposta:', response);

            if (response.data?.branches) {
                const branches = response.data.branches;
                console.log('[Dashboard] Branches encontradas:', branches.length, branches);

                // Calcular estatísticas
                const newStats = {
                    total: branches.length,
                    active: branches.filter(b => b.subscriptionStatus === 'ACTIVE').length,
                    trial: branches.filter(b => b.subscriptionStatus === 'TRIAL').length,
                    suspended: branches.filter(b => b.subscriptionStatus === 'SUSPENDED').length,
                    cancelled: branches.filter(b => b.subscriptionStatus === 'CANCELLED').length,
                    pastDue: branches.filter(b => b.subscriptionStatus === 'PAST_DUE').length,
                };
                console.log('[Dashboard] Stats calculadas:', newStats);

                setStats(newStats);

                // Últimas 5 academias criadas
                const sorted = [...branches].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setRecentBranches(sorted.slice(0, 5));
            } else {
                console.log('[Dashboard] Sem branches na resposta:', response);
            }
        } catch (error) {
            console.error('[Dashboard] Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const statusColors = {
        TRIAL: 'badge-soft-info',
        ACTIVE: 'badge-soft-success',
        PAST_DUE: 'badge-soft-warning',
        SUSPENDED: 'badge-soft-danger',
        CANCELLED: 'badge-soft-secondary',
    };

    const statusLabels = {
        TRIAL: 'Teste',
        ACTIVE: 'Ativa',
        PAST_DUE: 'Pendente',
        SUSPENDED: 'Suspensa',
        CANCELLED: 'Cancelada',
    };

    if (!isAdmin) {
        return (
            <AdminHorizontalLayout title="Acesso Negado">
                <Meta title="Painel Swim - Acesso Negado" />
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                    <p className="text-gray-600 mt-2">Você não tem permissão para acessar esta página.</p>
                </div>
            </AdminHorizontalLayout>
        );
    }

    return (
        <AdminHorizontalLayout title="Dashboard" subtitle="Visão geral do sistema">
            <Meta title="Painel Swim - Dashboard" />

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-muted">Carregando...</p>
                </div>
            ) : (
                <>
                    {/* Cards de Estatísticas */}
                    <Miniwidget reports={[
                        {
                            title: 'Total Academias',
                            iconClass: 'briefcase-check',
                            total: stats.total,
                            average: '+100%',
                            badgecolor: 'info',
                        },
                        {
                            title: 'Ativas',
                            iconClass: 'check-circle',
                            total: stats.active,
                            average: 'Pagamento OK',
                            badgecolor: 'success',
                        },
                        {
                            title: 'Em Teste',
                            iconClass: 'clock-outline',
                            total: stats.trial,
                            average: '14 dias',
                            badgecolor: 'warning',
                        },
                        {
                            title: 'Suspensas',
                            iconClass: 'alert-circle',
                            total: stats.suspended + stats.cancelled,
                            average: `${stats.cancelled} canc.`,
                            badgecolor: 'danger',
                        },
                    ]} />

                    {/* Tabela de Academias Recentes */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="card-title mb-0">Academias Recentes</h4>
                                        <Link href="/account/admin/branches" className="btn btn-sm btn-outline-primary">
                                            Ver todas
                                        </Link>
                                    </div>

                                    {recentBranches.length === 0 ? (
                                        <p className="text-muted text-center py-4">Nenhuma academia cadastrada</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Academia</th>
                                                        <th>Status</th>
                                                        <th>Criada em</th>
                                                        <th>Vencimento</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentBranches.map((branch) => (
                                                        <tr key={branch.id}>
                                                            <td>
                                                                <h5 className="font-size-14 mb-0">{branch.name}</h5>
                                                                <span className="text-muted small">{branch.email || branch.slug}</span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${statusColors[branch.subscriptionStatus]}`}>
                                                                    {statusLabels[branch.subscriptionStatus]}
                                                                </span>
                                                            </td>
                                                            <td className="text-muted">{formatDate(branch.createdAt)}</td>
                                                            <td className="text-muted">
                                                                {branch.subscriptionStatus === 'TRIAL'
                                                                    ? formatDate(branch.trialEndsAt)
                                                                    : formatDate(branch.subscriptionEndsAt) || '-'}
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
                </>
            )}
        </AdminHorizontalLayout>
    );
};

export const getServerSideProps = async (context) => {
    const session = await getSession(context);

    return {
        props: {
            isAdmin: session?.user?.role === 'ADMIN',
        },
    };
};

export default AdminDashboard;
