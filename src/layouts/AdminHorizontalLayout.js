import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import menu from '@/config/menu/index';
import { useBranch } from '@/providers/branch';

const AdminHorizontalLayout = ({ children, title = 'Painel Swim', subtitle = '' }) => {
    const { status, data } = useSession();
    const router = useRouter();
    const { branch } = useBranch();
    const navigation = menu(branch?.slug);
    const [openMenu, setOpenMenu] = useState(null);

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
                                            src="/images/logoswim.png"
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

                        <div className="d-flex">
                            {/* Profile */}
                            <div className="dropdown d-inline-block">
                                <button
                                    type="button"
                                    className="btn header-item waves-effect"
                                    id="page-header-user-dropdown"
                                >
                                    <span className="d-none d-xl-inline-block ms-1">{data?.user?.name || data?.user?.email}</span>
                                </button>
                            </div>
                            <button
                                type="button"
                                className="btn header-item noti-icon waves-effect"
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
                                            {navigation.map((section, idx) => (
                                                <li className="nav-item dropdown" key={idx}>
                                                    <Link
                                                        href="#"
                                                        className="nav-link dropdown-toggle arrow-none"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setOpenMenu(openMenu === idx ? null : idx);
                                                        }}
                                                    >
                                                        <i className={`${section.icon} me-2`}></i>
                                                        {section.name}
                                                    </Link>
                                                    <div className={`dropdown-menu ${openMenu === idx ? 'show' : ''}`}>
                                                        {section.menuItems.map((item) => {
                                                            const isActive = router.asPath === item.path || router.pathname === item.path;
                                                            return (
                                                                <Link
                                                                    key={item.path}
                                                                    href={item.path}
                                                                    className={`dropdown-item ${isActive ? 'active' : ''}`}
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </li>
                                            ))}
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
