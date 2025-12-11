import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import isEmail from 'validator/lib/isEmail';

import Meta from '@/components/Meta/index';
import { AuthLayout } from '@/layouts/index';

const Register = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setSubmittingState] = useState(false);

    const validate =
        name.length >= 2 &&
        isEmail(email) &&
        password.length >= 6 &&
        password === confirmPassword;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmittingState(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao criar conta');
            }

            toast.success('Conta criada com sucesso! Faça login.');
            router.push('/auth/login');
        } catch (error) {
            toast.error(error.message);
        }

        setSubmittingState(false);
    };

    return (
        <AuthLayout>
            <Meta
                title="Painel Swim | Cadastro"
                description="Crie sua conta"
            />
            <div className="flex flex-col items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
                <div>
                    <Link href="/" className="text-4xl font-bold">
                        Painel Swim
                    </Link>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Criar Conta</h1>
                    <h2 className="text-gray-600">
                        Preencha os dados para se cadastrar
                    </h2>
                </div>
                <form className="flex flex-col w-full space-y-3" onSubmit={handleSubmit}>
                    <input
                        className="px-3 py-2 border rounded"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nome completo"
                        type="text"
                        value={name}
                    />
                    <input
                        className="px-3 py-2 border rounded"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        value={email}
                    />
                    <input
                        className="px-3 py-2 border rounded"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha (mínimo 6 caracteres)"
                        type="password"
                        value={password}
                    />
                    <input
                        className="px-3 py-2 border rounded"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar senha"
                        type="password"
                        value={confirmPassword}
                    />
                    {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-red-500">As senhas não coincidem</p>
                    )}
                    <button
                        className="py-2 text-white bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-75"
                        disabled={!validate || isSubmitting}
                        type="submit"
                    >
                        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>
                <div className="text-sm text-gray-500">
                    Já tem uma conta?{' '}
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                        Entrar
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Register;
