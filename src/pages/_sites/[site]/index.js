import DefaultErrorPage from 'next/error';
import Link from 'next/link';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta';
import { getSiteBranch } from '@/prisma/services/branch';

const Site = ({ branch }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  return branch ? (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gradient-to-br from-blue-50 to-blue-100">
      <Meta title={`${branch.name} - Painel Swim`} />

      {/* Header */}
      <div className="w-full p-4 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {branch.logoUrl ? (
              <img src={branch.logoUrl} alt={branch.name} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {branch.name.charAt(0)}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-800">{branch.name}</h1>
          </div>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-500"
          >
            Entrar
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-8 text-center">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-800">
            Bem-vindo à {branch.name}
          </h2>
          <p className="text-xl text-gray-600">
            Sistema de gestão da academia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/login"
            className="px-8 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-500 font-medium"
          >
            Acessar o Sistema
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
          >
            Criar Conta
          </Link>
        </div>

        {branch.telephone && (
          <p className="text-gray-500">
            Contato: {branch.telephone}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="w-full p-4 text-center text-gray-500 text-sm">
        <p>Powered by <strong>Painel Swim</strong></p>
      </div>
    </main>
  ) : (
    <>
      <Meta noIndex />
      <DefaultErrorPage statusCode={404} />
    </>
  );
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({ params }) => {
  const { site } = params;
  let branch = null;

  try {
    const siteBranch = await getSiteBranch(site, site.includes('.'));

    if (siteBranch) {
      branch = {
        name: siteBranch.name,
        slug: siteBranch.slug,
        logoUrl: siteBranch.logoUrl,
        telephone: siteBranch.telephone,
      };
    }
  } catch (error) {
    console.error('Erro ao buscar academia:', error.message);
  }

  return {
    props: { branch },
    revalidate: 10,
  };
};

export default Site;
