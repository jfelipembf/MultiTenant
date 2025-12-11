import { useEffect, useState } from 'react';
import { DocumentDuplicateIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { getSession } from 'next-auth/react';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import Card from '@/components/Card/index';
import Button from '@/components/Button/index';
import { AccountLayout } from '@/layouts/index';
import { useBranch } from '@/providers/branch';
import { getBranch } from '@/prisma/services/branch';
import api from '@/lib/common/api';

const subscriptionStatusLabels = {
  TRIAL: 'Período de Teste',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento Pendente',
  SUSPENDED: 'Suspensa',
  CANCELLED: 'Cancelada',
};

const subscriptionStatusColors = {
  TRIAL: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAST_DUE: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const planLabels = {
  BASIC: 'Básico',
  PRO: 'Profissional',
  ENTERPRISE: 'Empresarial',
};

const BranchDashboard = ({ branch: branchData }) => {
  const { branch, setBranch } = useBranch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (branchData) {
      setBranch(branchData);
      setFormData(branchData);
    }
  }, [branchData, setBranch]);

  const currentBranch = branch || branchData;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.painelswim.com';
  const academiaUrl = `${appUrl}/academia/${currentBranch?.slug}`;

  const copyToClipboard = () => toast.success('Copiado!');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
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

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (!currentBranch) return null;

  const InfoField = ({ label, name, value, type = 'text', editable = true }) => (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
      {isEditing && editable ? (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <span className="text-gray-900">{value || '-'}</span>
      )}
    </div>
  );

  return (
    <AccountLayout>
      <Meta title={`Painel Swim - ${currentBranch?.name || 'Academia'}`} />
      <Content.Title
        title={currentBranch?.name || 'Academia'}
        subtitle="Visualize e edite os dados da academia"
      />
      <Content.Divider />
      <Content.Container>
        {/* Ações */}
        <div className="flex justify-end mb-4 space-x-2">
          {isEditing ? (
            <>
              <Button
                className="text-white bg-green-600 hover:bg-green-500"
                disabled={saving}
                onClick={handleSave}
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                className="text-gray-700 bg-gray-200 hover:bg-gray-300"
                onClick={handleCancel}
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              className="text-white bg-blue-600 hover:bg-blue-500"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
          {/* Link de Acesso */}
          <Card>
            <Card.Body title="Link de Acesso">
              <div className="flex items-center justify-between px-3 py-2 mt-2 space-x-2 font-mono text-xs bg-gray-100 border rounded">
                <span className="overflow-x-auto text-blue-600 truncate">{academiaUrl}</span>
                <CopyToClipboard onCopy={copyToClipboard} text={academiaUrl}>
                  <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600 flex-shrink-0" />
                </CopyToClipboard>
              </div>
            </Card.Body>
          </Card>

          {/* Status da Assinatura */}
          <Card>
            <Card.Body title="Assinatura">
              <div className="mt-2 space-y-2">
                <span className={`px-3 py-1 text-sm rounded-full ${subscriptionStatusColors[currentBranch?.subscriptionStatus]}`}>
                  {subscriptionStatusLabels[currentBranch?.subscriptionStatus]}
                </span>
                <p className="text-sm text-gray-500">
                  Plano: {planLabels[currentBranch?.subscriptionPlan]}
                </p>
                {currentBranch?.subscriptionStatus === 'TRIAL' && currentBranch?.trialEndsAt && (
                  <p className="text-xs text-gray-400">
                    Expira em: {formatDate(currentBranch.trialEndsAt)}
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Código */}
          <Card>
            <Card.Body title="Código da Academia">
              <div className="flex items-center justify-between px-3 py-2 mt-2 space-x-2 font-mono text-sm bg-gray-100 border rounded">
                <span className="overflow-x-auto">{currentBranch?.branchCode}</span>
                <CopyToClipboard onCopy={copyToClipboard} text={currentBranch?.branchCode}>
                  <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600 flex-shrink-0" />
                </CopyToClipboard>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Dados da Academia */}
        <Card>
          <Card.Body title="Dados da Academia" subtitle="Informações cadastrais">
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
              <InfoField label="Nome" name="name" value={currentBranch?.name} />
              <InfoField label="Nome Interno" name="internalName" value={currentBranch?.internalName} />
              <InfoField label="CNPJ" name="cnpj" value={currentBranch?.cnpj} />
              <InfoField label="Email" name="email" value={currentBranch?.email} type="email" />
              <InfoField label="Telefone" name="telephone" value={currentBranch?.telephone} />
              <InfoField label="WhatsApp" name="whatsapp" value={currentBranch?.whatsapp} />
              <InfoField label="Website" name="website" value={currentBranch?.website} />
              <InfoField label="Slug" name="slug" value={currentBranch?.slug} editable={false} />
              <InfoField label="ID da Academia" name="idBranch" value={currentBranch?.idBranch} type="number" />
            </div>
          </Card.Body>
        </Card>

        {/* Endereço */}
        <Card className="mt-4">
          <Card.Body title="Endereço" subtitle="Localização da academia">
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
              <InfoField label="CEP" name="zipCode" value={currentBranch?.zipCode} />
              <InfoField label="Endereço" name="address" value={currentBranch?.address} />
              <InfoField label="Número" name="number" value={currentBranch?.number} />
              <InfoField label="Complemento" name="complement" value={currentBranch?.complement} />
              <InfoField label="Bairro" name="neighborhood" value={currentBranch?.neighborhood} />
              <InfoField label="Cidade" name="city" value={currentBranch?.city} />
              <InfoField label="Estado" name="state" value={currentBranch?.state} />
              <InfoField label="UF" name="stateShort" value={currentBranch?.stateShort} />
            </div>
          </Card.Body>
        </Card>


        {/* Informações do Sistema */}
        <Card className="mt-4">
          <Card.Body title="Informações do Sistema" subtitle="Dados gerados automaticamente">
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Criado em</label>
                <span className="text-gray-900">{formatDate(currentBranch?.createdAt)}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Código de Convite</label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 font-mono text-sm">{currentBranch?.inviteCode}</span>
                  <CopyToClipboard onCopy={copyToClipboard} text={currentBranch?.inviteCode}>
                    <DocumentDuplicateIcon className="w-4 h-4 cursor-pointer hover:text-blue-600" />
                  </CopyToClipboard>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Latitude</label>
                <span className="text-gray-900">{currentBranch?.latitude || '-'}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Longitude</label>
                <span className="text-gray-900">{currentBranch?.longitude || '-'}</span>
              </div>
            </div>
          </Card.Body>
        </Card>
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
