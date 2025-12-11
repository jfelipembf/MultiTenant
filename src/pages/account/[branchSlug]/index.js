import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { getSession } from 'next-auth/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CheckIcon, DocumentDuplicateIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import Meta from '@/components/Meta/index';
import { AdminHorizontalLayout } from '@/layouts/index';
import { useBranch } from '@/providers/branch';
import { getBranch } from '@/prisma/services/branch';
import api from '@/lib/common/api';

const STATUS_LABELS = {
  TRIAL: 'Período de Teste',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento Pendente',
  SUSPENDED: 'Suspensa',
  CANCELLED: 'Cancelada',
};

const PLAN_LABELS = {
  BASIC: 'Básico',
  PRO: 'Profissional',
  ENTERPRISE: 'Empresarial',
};

const BADGE_CLASSES = {
  TRIAL: 'badge-soft-info',
  ACTIVE: 'badge-soft-success',
  PAST_DUE: 'badge-soft-warning',
  SUSPENDED: 'badge-soft-danger',
  CANCELLED: 'badge-soft-secondary',
};

const MiniStatCard = ({ icon, title, children }) => (
  <div className="card mini-stats-wid h-100">
    <div className="card-body">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 avatar-sm me-3">
          <span className="avatar-title rounded-circle bg-soft-primary text-primary fs-4">
            <i className={icon}></i>
          </span>
        </div>
        <div className="flex-grow-1">
          <p className="text-muted fw-medium mb-2">{title}</p>
          {children}
        </div>
      </div>
    </div>
  </div>
);

const InfoListCard = ({ title, subtitle, items, isEditing, formData, currentBranch, handleChange }) => (
  <div className="card h-100">
    <div className="card-body pb-0">
      <h4 className="card-title mb-1">{title}</h4>
      {subtitle && <p className="card-title-desc text-muted mb-0">{subtitle}</p>}
    </div>
    <ul className="list-group list-group-flush">
      {items.map((item) => (
        <li className="list-group-item d-flex justify-content-between align-items-center" key={item.key}>
          <div className="text-muted text-uppercase small fw-semibold">{item.label}</div>
          <div className="ms-3 flex-grow-1 text-end">
            {isEditing && item.editable !== false ? (
              <input
                type={item.type || 'text'}
                name={item.key}
                value={formData[item.key] ?? ''}
                maxLength={item.maxLength}
                className="form-control form-control-sm text-end"
                onChange={handleChange}
              />
            ) : item.render ? (
              item.render(currentBranch)
            ) : (
              <span className="fw-semibold text-dark">{currentBranch?.[item.key] || '-'}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const BranchDashboard = ({ branch: branchData }) => {
  const router = useRouter();
  const { branchSlug } = router.query;
  const { branch, setBranch } = useBranch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!branch && !branchData);

  // Se não temos dados no provider nem do SSR, busca via API
  useEffect(() => {
    if (branchData) {
      setBranch(branchData);
      setFormData(branchData);
      setLoading(false);
    } else if (branch) {
      setFormData(branch);
      setLoading(false);
    } else if (branchSlug && !branch) {
      // Fetch client-side apenas se necessário
      api(`/api/branch/${branchSlug}`)
        .then((res) => {
          if (res.data?.branch) {
            setBranch(res.data.branch);
            setFormData(res.data.branch);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [branchData, branch, branchSlug, setBranch]);

  const currentBranch = branch || branchData;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.painelswim.com';
  const academyUrl = useMemo(() => (currentBranch ? `${appUrl}/academia/${currentBranch.slug}` : ''), [appUrl, currentBranch]);

  const copyToClipboard = (text) => {
    if (!text) return;
    toast.success('Copiado!');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentBranch) return;
    setSaving(true);
    try {
      const response = await api(`/api/branch/${currentBranch.slug}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Dados salvos com sucesso!');
        setBranch({ ...currentBranch, ...formData });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(currentBranch);
    setIsEditing(false);
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('pt-BR') : '-');
  const formatDateTime = (date) =>
    date
      ? new Date(date).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
      : '-';

  if (loading) {
    return (
      <AdminHorizontalLayout title="Carregando..." subtitle="">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </AdminHorizontalLayout>
    );
  }

  if (!currentBranch) return null;

  const commercialItems = [
    {
      label: 'ID da Academia',
      key: 'idBranch',
      editable: false,
      render: () => <span className="fw-semibold text-dark font-monospace">{String(currentBranch?.idBranch ?? '-').padStart(4, '0')}</span>,
    },
    { label: 'Nome Fantasia', key: 'name' },
    { label: 'Nome Interno', key: 'internalName' },
    { label: 'CNPJ', key: 'cnpj' },
    { label: 'Website', key: 'website' },
  ];

  const contactItems = [
    { label: 'E-mail', key: 'email', type: 'email' },
    { label: 'Telefone', key: 'telephone' },
    { label: 'WhatsApp', key: 'whatsapp' },
    {
      label: 'Slug',
      key: 'slug',
      editable: false,
      render: () => <span className="badge bg-soft-secondary text-dark">{currentBranch?.slug || '-'}</span>,
    },
  ];

  const addressItems = [
    { label: 'CEP', key: 'zipCode' },
    { label: 'Endereço', key: 'address' },
    { label: 'Número', key: 'number' },
    { label: 'Complemento', key: 'complement' },
    { label: 'Bairro', key: 'neighborhood' },
    { label: 'Cidade', key: 'city' },
    { label: 'Estado', key: 'state' },
    { label: 'UF', key: 'stateShort', maxLength: 2 },
  ];

  const systemItems = [
    {
      label: 'Criado em',
      key: 'createdAt',
      editable: false,
      render: () => <span className="fw-semibold text-dark">{formatDate(currentBranch?.createdAt)}</span>,
    },
    {
      label: 'Código de Convite',
      key: 'inviteCode',
      editable: false,
      render: () => (
        <div className="d-flex align-items-center justify-content-end gap-2">
          <span className="fw-semibold text-dark font-monospace">{currentBranch?.inviteCode || '-'}</span>
          {currentBranch?.inviteCode && (
            <CopyToClipboard text={currentBranch.inviteCode} onCopy={() => copyToClipboard(currentBranch.inviteCode)}>
              <DocumentDuplicateIcon width={16} height={16} role="button" className="text-primary" />
            </CopyToClipboard>
          )}
        </div>
      ),
    },
    { label: 'Latitude', key: 'latitude', editable: false },
    { label: 'Longitude', key: 'longitude', editable: false },
  ];

  return (
    <AdminHorizontalLayout title={currentBranch?.name || 'Academia'} subtitle="Visualize e edite os dados da academia">
      <Meta title={`Painel Swim - ${currentBranch?.name || 'Academia'}`} />

      <div className="row g-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-4 align-items-center">
                <div className="col-sm-auto">
                  <div className="avatar-xxl rounded-circle overflow-hidden border" style={{ width: 120, height: 120 }}>
                    {currentBranch?.logoUrl ? (
                      <Image
                        src={currentBranch.logoUrl}
                        alt={currentBranch.name}
                        width={120}
                        height={120}
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="avatar-title rounded-circle bg-soft-primary text-primary fs-2 d-flex align-items-center justify-content-center h-100">
                        {currentBranch?.name?.slice(0, 2).toUpperCase() || 'AC'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col">
                  <h4 className="mb-1">{currentBranch?.name}</h4>
                  <p className="text-muted mb-1">
                    {currentBranch?.city ? `${currentBranch.city} - ${currentBranch.state}` : 'Sem localização definida'}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-soft-primary text-primary">ID #{String(currentBranch?.idBranch ?? '-').padStart(4, '0')}</span>
                    <span className="badge bg-soft-secondary text-muted">{currentBranch?.subscriptionPlan ? PLAN_LABELS[currentBranch.subscriptionPlan] : 'Plano indefinido'}</span>
                  </div>
                </div>
                <div className="col-sm-auto text-sm-end">
                  {isEditing ? (
                    <div className="d-flex flex-wrap gap-2">
                      <button className="btn btn-success" disabled={saving} onClick={handleSave}>
                        <CheckIcon width={16} height={16} className="me-1" />
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button className="btn btn-light" onClick={handleCancel}>
                        <XMarkIcon width={16} height={16} className="me-1" />
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                      <PencilIcon width={16} height={16} className="me-1" />
                      Editar dados
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-muted fw-medium mb-2">Link público</p>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="bg-light border rounded px-3 py-2 flex-grow-1 text-truncate text-primary">
                    {academyUrl || 'Nenhum link disponível'}
                  </div>
                  <CopyToClipboard text={academyUrl} onCopy={() => copyToClipboard(academyUrl)}>
                    <button className="btn btn-soft-primary btn-sm">
                      <DocumentDuplicateIcon width={16} height={16} className="me-1" />
                      Copiar
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <MiniStatCard icon="ti-shield" title="Assinatura">
            <span className={`badge rounded-pill ${BADGE_CLASSES[currentBranch?.subscriptionStatus] || 'badge-soft-secondary'}`}>
              {STATUS_LABELS[currentBranch?.subscriptionStatus] || 'Indefinido'}
            </span>
            <p className="text-muted mt-2 mb-0">Plano: {PLAN_LABELS[currentBranch?.subscriptionPlan] || '—'}</p>
            {currentBranch?.subscriptionStatus === 'TRIAL' && currentBranch?.trialEndsAt && (
              <small className="text-muted">Expira em {formatDate(currentBranch.trialEndsAt)}</small>
            )}
          </MiniStatCard>
        </div>
        <div className="col-lg-4 col-md-6">
          <MiniStatCard icon="ti-lock" title="Código da Academia">
            <div className="d-flex align-items-center justify-content-between bg-light rounded px-3 py-2">
              <span className="text-dark font-monospace me-2">{currentBranch?.branchCode || '-'}</span>
              <CopyToClipboard text={currentBranch?.branchCode || ''} onCopy={() => copyToClipboard(currentBranch?.branchCode || '')}>
                <DocumentDuplicateIcon width={18} height={18} role="button" className="text-primary" />
              </CopyToClipboard>
            </div>
          </MiniStatCard>
        </div>
        <div className="col-lg-4 col-md-6">
          <MiniStatCard icon="ti-user" title="Código de Convite">
            <div className="d-flex align-items-center justify-content-between bg-light rounded px-3 py-2">
              <span className="text-dark font-monospace me-2">{currentBranch?.inviteCode || '-'}</span>
              {currentBranch?.inviteCode && (
                <CopyToClipboard text={currentBranch.inviteCode} onCopy={() => copyToClipboard(currentBranch.inviteCode)}>
                  <DocumentDuplicateIcon width={18} height={18} role="button" className="text-primary" />
                </CopyToClipboard>
              )}
            </div>
          </MiniStatCard>
        </div>

        <div className="col-12 col-lg-6">
          <InfoListCard
            title="Detalhes Comerciais"
            subtitle="Informações principais"
            items={commercialItems}
            isEditing={isEditing}
            formData={formData}
            currentBranch={currentBranch}
            handleChange={handleChange}
          />
        </div>
        <div className="col-12 col-lg-6">
          <InfoListCard
            title="Contato"
            subtitle="Dados de comunicação"
            items={contactItems}
            isEditing={isEditing}
            formData={formData}
            currentBranch={currentBranch}
            handleChange={handleChange}
          />
        </div>

        <div className="col-12">
          <InfoListCard
            title="Endereço"
            subtitle="Localização completa"
            items={addressItems}
            isEditing={isEditing}
            formData={formData}
            currentBranch={currentBranch}
            handleChange={handleChange}
          />
        </div>

        <div className="col-12 mb-4">
          <InfoListCard
            title="Informações do Sistema"
            subtitle="Dados automáticos"
            items={systemItems}
            isEditing={false}
            formData={formData}
            currentBranch={currentBranch}
            handleChange={handleChange}
          />
        </div>

        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-4">
                <div className="row flex-grow-1 g-4">
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Status de pagamento</p>
                    <span className={`badge rounded-pill ${BADGE_CLASSES[currentBranch?.subscriptionStatus] || 'badge-soft-secondary'}`}>
                      {STATUS_LABELS[currentBranch?.subscriptionStatus] || 'Indefinido'}
                    </span>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Próxima cobrança</p>
                    <span className="fw-semibold text-dark">{formatDate(currentBranch?.subscriptionEndsAt)}</span>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Último pagamento</p>
                    <span className="fw-semibold text-dark">{formatDateTime(currentBranch?.lastPaymentAt)}</span>
                  </div>
                  <div className="col-md-3">
                    <p className="text-muted mb-1">Assinatura Stripe</p>
                    <span className="text-muted font-monospace">{currentBranch?.stripeSubscriptionId || '-'}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/account/billing" className="btn btn-outline-primary">
                    Gerenciar assinatura
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminHorizontalLayout>
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
      branch: branch ? JSON.parse(JSON.stringify(branch)) : null,
    },
  };
};

export default BranchDashboard;
