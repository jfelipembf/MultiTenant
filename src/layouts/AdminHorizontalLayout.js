import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import menu from '@/config/menu/index';
import { useBranch } from '@/providers/branch';

const AdminHorizontalLayout = ({ children, title = 'Painel Swim' }) => {
    const { status, data } = useSession();
    const router = useRouter();
    const { branch } = useBranch();
    const navigation = menu(branch?.slug);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return null;
    }

    return (
        <div className="admin-layout">
            <Toaster position="bottom-left" toastOptions={{ duration: 8000 }} />
            <div id="layout-wrapper">
                <header className="admin-header">
                    <div className="admin-header__brand">
                        <span className="admin-header__brand-subtitle">Painel Swim</span>
                        <span className="admin-header__brand-title">Administração</span>
                    </div>
                    <div className="admin-header__actions">
                        <span className="admin-header__badge">Beta</span>
                        <span className="admin-header__user">{data?.user?.email}</span>
                    </div>
                </header>

                <div className="top-navigation">
                    <div className="page-title-content">
                        <h1>{title}</h1>
                        <p>Gerencie academias, assinaturas e configurações globais</p>
                    </div>
                    <nav className="admin-navbar">
                        {navigation.map((section) => (
                            <div key={section.name} className="admin-nav-section" tabIndex={0}>
                                {section.name}
                                <div className="admin-nav-section__items">
                                    {section.menuItems.map((item) => {
                                        const isActive = router.pathname === item.path;
                                        return (
                                            <Link key={item.path} href={item.path} className={`admin-nav-link ${isActive ? 'active' : ''}`}>
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                <main className="admin-content">
                    <section className="admin-content__card">{children}</section>
                </main>

                <footer className="admin-footer">© {new Date().getFullYear()} Painel Swim. Todos os direitos reservados.</footer>
            </div>
        </div>
    );
};

export default AdminHorizontalLayout;
