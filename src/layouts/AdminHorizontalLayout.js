import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import menu from '@/config/menu/index';

const AdminHorizontalLayout = ({ children, title = 'Painel Swim', subtitle = '' }) => {
    const { status, data } = useSession();
    const router = useRouter();
    const navigation = menu();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/login');
        }
    }, [status, router]);

    // Set data-layout attribute for horizontal styles
    useEffect(() => {
        document.body.setAttribute('data-layout', 'horizontal');
        return () => document.body.removeAttribute('data-layout');
    }, []);

    if (status === 'loading') {
        return null;
    }

    const userInitial = data?.user?.name?.charAt(0) || data?.user?.email?.charAt(0) || 'U';

    return (
        <>
            <Toaster position="bottom-left" toastOptions={{ duration: 8000 }} />
            <div id="layout-wrapper">
                {/* Header */}
                <header id="page-topbar">
                    <div className="navbar-header">
                        <div className="d-flex">
                            {/* Logo */}
                            <div className="navbar-brand-box">
                                <Link href="/account" className="logo logo-dark">
                                    <span className="logo-lg">
                                        <Image
                                            src="/images/logoSwim.png"
                                            alt="Painel Swim"
                                            width={140}
                                            height={35}
                                            style={{ objectFit: 'contain' }}
                                            priority
                                        />
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="d-flex align-items-center">
                            {/* Profile com Avatar */}
                            <Link
                                href="/account/settings"
                                className="d-flex align-items-center text-decoration-none header-item"
                                title="Meu Perfil"
                            >
                                <span className="d-none d-xl-inline-block me-2 text-dark">
                                    {data?.user?.name || data?.user?.email}
                                </span>
                                {data?.user?.image ? (
                                    <Image
                                        src={data.user.image}
                                        alt="Avatar"
                                        width={36}
                                        height={36}
                                        className="rounded-circle"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                        style={{ width: 36, height: 36, fontSize: 14 }}
                                    >
                                        {(data?.user?.name?.charAt(0) || data?.user?.email?.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                )}
                            </Link>
                            <button
                                type="button"
                                className="btn header-item noti-icon waves-effect ms-2"
                                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                                title="Sair"
                            >
                                <i className="mdi mdi-logout"></i>
                            </button>
                        </div>
                    </div>

                    {/* Top Navigation */}
                    <div className="top-navigation">
                        <div className="page-title-content">
                            <div className="container-fluid">
                                <div className="page-title-box">
                                    <h4 className="mb-0">{title}</h4>
                                    {subtitle && <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)' }}>{subtitle}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="topnav">
                            <div className="container-fluid">
                                <nav className="navbar navbar-light navbar-expand-lg topnav-menu">
                                    <div className="navbar-collapse" id="topnav-menu-content">
                                        <ul className="navbar-nav">
                                            {navigation.map((item, idx) => {
                                                const isActive = router.asPath === item.path || router.asPath.startsWith(item.path + '/');
                                                return (
                                                    <li className="nav-item" key={idx}>
                                                        <Link
                                                            href={item.path}
                                                            className={`nav-link ${isActive ? 'active' : ''}`}
                                                        >
                                                            <i className={`${item.icon} me-2`}></i>
                                                            {item.name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            {children}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default AdminHorizontalLayout;
