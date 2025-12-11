import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import Meta from '@/components/Meta/index';
import Content from '@/components/Content/index';
import Card from '@/components/Card/index';
import Button from '@/components/Button/index';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';

const statusColors = {
    TRIAL: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    PAST_DUE: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
    TRIAL: 'Período de Teste',
    ACTIVE: 'Ativa',
    PAST_DUE: 'Pagamento Pendente',
    SUSPENDED: 'Suspensa',
    CANCELLED: 'Cancelada',
};

const planLabels = {
    BASIC: 'Básico',
    PRO: 'Profissional',
    ENTERPRISE: 'Empresarial',
};

const AdminBranches = ({ isAdmin }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchBranches = async () => {
        try {
            const response = await api('/api/admin/branches');
            if (response.data?.branches) {
                setBranches(response.data.branches);
            }
        } catch (error) {
            toast.error('Erro ao carregar academias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchBranches();
        }
    }, [isAdmin]);

    const handleAction = async (branchId, action, plan = null) => {
        setActionLoading(branchId);
        try {
            const response = await api(`/api/admin/branches/${branchId}/subscription`, {
                method: 'PUT',
                body: { action, plan },
            });

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success(response.message || 'Ação executada com sucesso');
                fetchBranches();
            }
        } catch (error) {
            toast.error('Erro ao executar ação');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    if (!isAdmin) {
        return (
            <AccountLayout>
                <Meta title="Painel Swim - Acesso Negado" />
                <Content.Container>
                    <div className="text-center py-10">
                        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                        <p className="text-gray-600 mt-2">Você não tem permissão para acessar esta página.</p>
                    </div>
                </Content.Container>
            </AccountLayout>
        );
    }

    return (
        <AccountLayout>
            <Meta title="Painel Swim - Gerenciar Academias" />
            <Content.Title
                title="Gerenciar Academias"
                subtitle="Controle de assinaturas e acesso das academias"
            />
            <Content.Divider />
            <Content.Container>
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-gray-600">Carregando...</p>
                    </div>
                ) : branches.length === 0 ? (
                    <Card>
                        <Card.Body
                            title="Nenhuma academia cadastrada"
                            subtitle="As academias aparecerão aqui quando forem criadas"
                        />
                    </Card>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Academia
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Plano
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Vencimento
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Último Pagamento
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {branches.map((branch) => (
                                    <tr key={branch.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">{branch.name}</div>
                                                <div className="text-sm text-gray-500">{branch.email || branch.slug}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[branch.subscriptionStatus]}`}>
                                                {statusLabels[branch.subscriptionStatus]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {planLabels[branch.subscriptionPlan]}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {branch.subscriptionStatus === 'TRIAL'
                                                ? formatDate(branch.trialEndsAt)
                                                : formatDate(branch.subscriptionEndsAt)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(branch.lastPaymentAt)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                            {branch.subscriptionStatus === 'SUSPENDED' || branch.subscriptionStatus === 'CANCELLED' ? (
                                                <Button
                                                    className="text-white bg-green-600 hover:bg-green-500 text-xs px-2 py-1"
                                                    disabled={actionLoading === branch.id}
                                                    onClick={() => handleAction(branch.id, 'release')}
                                                >
                                                    Liberar
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="text-white bg-red-600 hover:bg-red-500 text-xs px-2 py-1"
                                                    disabled={actionLoading === branch.id}
                                                    onClick={() => handleAction(branch.id, 'suspend')}
                                                >
                                                    Suspender
                                                </Button>
                                            )}
                                            {branch.subscriptionStatus === 'TRIAL' && (
                                                <Button
                                                    className="text-white bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1"
                                                    disabled={actionLoading === branch.id}
                                                    onClick={() => handleAction(branch.id, 'activate', 'BASIC')}
                                                >
                                                    Ativar
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Content.Container>
        </AccountLayout>
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

export default AdminBranches;
