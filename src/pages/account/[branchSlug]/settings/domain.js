import { useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import isFQDN from 'validator/lib/isFQDN';

import Button from '@/components/Button/index';
import DomainCard from '@/components/Card/domain';
import Card from '@/components/Card/index';
import Meta from '@/components/Meta/index';
import { useDomains } from '@/hooks/data';
import { AdminHorizontalLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { getBranch, isBranchOwner } from '@/prisma/services/branch';
import { useTranslation } from "react-i18next";

const Domain = ({ isTeamOwner, branch }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useDomains(branch?.slug);
  const [domain, setDomain] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const validDomainName = isFQDN(domain);

  const addDomain = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api(`/api/branch/${branch?.slug}/domain`, {
      body: { domainName: domain },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        setDomain('');
        toast.success('Domínio adicionado com sucesso!');
      }
    });
  };

  const handleDomainChange = (event) => setDomain(event.target.value);

  const refresh = (domain, verified) => {
    setSubmittingState(true);

    if (verified) {
      mutate(`/api/branch/domain/check?domain=${domain}`).then(() =>
        setSubmittingState(false)
      );
    } else {
      api(`/api/branch/${branch?.slug}/domain`, {
        body: { domainName: domain },
        method: 'PUT',
      }).then((response) => {
        setSubmittingState(false);

        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          toast.success('Domínio verificado com sucesso!');
        }
      });
    }

    return verified;
  };

  const remove = (domain) => {
    api(`/api/branch/${branch?.slug}/domain`, {
      body: { domainName: domain },
      method: 'DELETE',
    }).then((response) => {
      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Domínio removido com sucesso!');
      }
    });
  };

  if (!branch) return null;

  return (
    <AdminHorizontalLayout title={t("settings.domain.subdomain.management")} subtitle={t("settings.domain.subdomain.management.description")}>
      <Meta title={`Painel Swim - ${branch.name} | Domínios`} />
      <div className="space-y-6">
        <Card>
          <Card.Body
            title={t("settings.domain.subdomain.title")}
            subtitle={t("settings.domain.subdomain.description")}
          >
            <div className="flex items-center justify-between px-3 py-2 font-mono text-sm border rounded md:w-1/2">
              <div>
                <strong>{branch.slug}</strong>
                <span className="pr-3">.{branch.host}</span>
              </div>
              <Link href={`http://${branch.hostname}`} target="_blank">
                <ArrowTopRightOnSquareIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
              </Link>
            </div>
          </Card.Body>
        </Card>
        {isTeamOwner && (
          <>
            <Card>
              <form>
                <Card.Body
                  title={t("settings.domain.add.label")}
                  subtitle={t("settings.domain.add.description")}
                >
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    disabled={isSubmitting}
                    onChange={handleDomainChange}
                    placeholder="mydomain.com"
                    type="text"
                    value={domain}
                  />
                </Card.Body>
                <Card.Footer>
                  <span />
                  <Button
                    className="text-white bg-blue-600 hover:bg-blue-500"
                    disabled={!validDomainName || isSubmitting}
                    onClick={addDomain}
                  >
                    Add
                  </Button>
                </Card.Footer>
              </form>
            </Card>
            {isLoading ? (
              <DomainCard isLoading />
            ) : data?.domains.length > 0 ? (
              data.domains.map((domain, index) => (
                <DomainCard
                  key={index}
                  apex={process.env.NEXT_PUBLIC_VERCEL_IP_ADDRESS}
                  cname={branch.hostname}
                  isLoading={isSubmitting}
                  domain={domain}
                  refresh={refresh}
                  remove={remove}
                />
              ))
            ) : (
              <div className="flex items-center justify-center p-5 bg-gray-100 border-4 border-dashed rounded">
                <p>{t("settings.domain.empty.message")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminHorizontalLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let isTeamOwner = false;
  let branch = null;

  if (session) {
    branch = await getBranch(
      session.user.userId,
      session.user.email,
      context.params.branchSlug
    );

    if (branch) {
      const { host } = new URL(process.env.APP_URL);
      isTeamOwner = isBranchOwner(session.user.email, branch);
      branch.host = host;
      branch.hostname = `${branch.slug}.${host}`;
    }
  }

  return {
    props: {
      isTeamOwner,
      branch,
    },
  };
};

export default Domain;
