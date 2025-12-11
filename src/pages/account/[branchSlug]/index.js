import { useEffect, useState } from 'react';
import { DocumentDuplicateIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { getSession } from 'next-auth/react';

import Meta from '@/components/Meta/index';
import Card from '@/components/Card/index';
import Button from '@/components/Button/index';
import { AdminHorizontalLayout } from '@/layouts/index';
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

// Formata o ID da academia como 0001, 0002, etc.
const formatIdBranch = (id) => {
  if (!id) return '-';
  return String(id).padStart(4, '0');
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

  return (
    <AdminHorizontalLayout title={currentBranch?.name || 'Academia'} subtitle="Visualize e edite os dados da academia">
      <Meta title={`Painel Swim - ${currentBranch?.name || 'Academia'}`} />
      <div className="space-y-6">
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
              {/* ID da Academia - Gerado automaticamente */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">ID da Academia</label>
                <span className="text-gray-900 font-mono">{formatIdBranch(currentBranch?.idBranch)}</span>
              </div>

              {/* Nome */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Nome</label>
                {isEditing ? (
                  <input type="text" name="name" value={formData.name || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.name || '-'}</span>
                )}
              </div>

              {/* Nome Interno */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Nome Interno</label>
                {isEditing ? (
                  <input type="text" name="internalName" value={formData.internalName || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.internalName || '-'}</span>
                )}
              </div>

              {/* CNPJ */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">CNPJ</label>
                {isEditing ? (
                  <input type="text" name="cnpj" value={formData.cnpj || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.cnpj || '-'}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.email || '-'}</span>
                )}
              </div>

              {/* Telefone */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Telefone</label>
                {isEditing ? (
                  <input type="text" name="telephone" value={formData.telephone || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.telephone || '-'}</span>
                )}
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">WhatsApp</label>
                {isEditing ? (
                  <input type="text" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.whatsapp || '-'}</span>
                )}
              </div>

              {/* Website */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Website</label>
                {isEditing ? (
                  <input type="text" name="website" value={formData.website || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.website || '-'}</span>
                )}
              </div>

              {/* Slug - Não editável */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Slug</label>
                <span className="text-gray-900">{currentBranch?.slug || '-'}</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Endereço */}
        <Card className="mt-4">
          <Card.Body title="Endereço" subtitle="Localização da academia">
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
              {/* CEP */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">CEP</label>
                {isEditing ? (
                  <input type="text" name="zipCode" value={formData.zipCode || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.zipCode || '-'}</span>
                )}
              </div>

              {/* Endereço */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Endereço</label>
                {isEditing ? (
                  <input type="text" name="address" value={formData.address || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.address || '-'}</span>
                )}
              </div>

              {/* Número */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Número</label>
                {isEditing ? (
                  <input type="text" name="number" value={formData.number || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.number || '-'}</span>
                )}
              </div>

              {/* Complemento */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Complemento</label>
                {isEditing ? (
                  <input type="text" name="complement" value={formData.complement || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.complement || '-'}</span>
                )}
              </div>

              {/* Bairro */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Bairro</label>
                {isEditing ? (
                  <input type="text" name="neighborhood" value={formData.neighborhood || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.neighborhood || '-'}</span>
                )}
              </div>

              {/* Cidade */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Cidade</label>
                {isEditing ? (
                  <input type="text" name="city" value={formData.city || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.city || '-'}</span>
                )}
              </div>

              {/* Estado */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Estado</label>
                {isEditing ? (
                  <input type="text" name="state" value={formData.state || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                ) : (
                  <span className="text-gray-900">{currentBranch?.state || '-'}</span>
                )}
              </div>

              {/* UF */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">UF</label>
                {isEditing ? (
                  <input type="text" name="stateShort" value={formData.stateShort || ''} onChange={handleChange}
                    className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" maxLength={2} />
                ) : (
                  <span className="text-gray-900">{currentBranch?.stateShort || '-'}</span>
                )}
              </div>
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
      branch,
    },
  };
};

export default BranchDashboard;
