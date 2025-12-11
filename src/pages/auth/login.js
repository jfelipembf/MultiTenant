import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import Meta from '@/components/Meta/index';
import { AuthLayout } from '@/layouts/index';

const Login = () => {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);

  const validate = isEmail(email) && password.length >= 6;

  const handleEmailChange = (event) => setEmail(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmittingState(true);

    const response = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      toast.error(response.error);
    } else {
      toast.success('Login realizado com sucesso!');
      router.push('/account');
    }

    setSubmittingState(false);
  };

  return (
    <AuthLayout>
      <Meta
        title="Painel Swim | Login"
        description="Faça login na sua conta"
      />
      <div className="flex flex-col items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
        <div>
          <Link href="/" className="text-4xl font-bold">
            Painel Swim
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <h2 className="text-gray-600">
            Acesse sua conta com email e senha
          </h2>
        </div>
        <form className="flex flex-col w-full space-y-3" onSubmit={handleSubmit}>
          <input
            className="px-3 py-2 border rounded"
            onChange={handleEmailChange}
            placeholder="Email"
            type="email"
            value={email}
          />
          <input
            className="px-3 py-2 border rounded"
            onChange={handlePasswordChange}
            placeholder="Senha"
            type="password"
            value={password}
          />
          <button
            className="py-2 text-white bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-75"
            disabled={status === 'loading' || !validate || isSubmitting}
            type="submit"
          >
            {status === 'loading'
              ? 'Verificando sessão...'
              : isSubmitting
                ? 'Entrando...'
                : 'Entrar'}
          </button>
        </form>
        <div className="text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
