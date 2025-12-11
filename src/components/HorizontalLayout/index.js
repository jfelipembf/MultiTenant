import React, { useEffect, useState } from "react"
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import Header from "./Header"
import Navbar from "./Navbar";

const HorizontalLayout = ({ children, title = 'Painel Swim' }) => {
  const { status } = useSession();
  const router = useRouter();
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const openMenu = () => {
    setIsMenuOpened(!isMenuOpened);
  };

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router.pathname]);

  if (status === 'loading') {
    return null;
  }

  return (
    <React.Fragment>
      <Toaster position="bottom-left" toastOptions={{ duration: 8000 }} />
      <div id="layout-wrapper">
        <header id="page-topbar">
          <Header
            isMenuOpened={isMenuOpened}
            openLeftMenuCallBack={openMenu}
          />
          <div className="top-navigation">
            <div className="page-title-content">
              <div className="container-fluid">
                <div className="page-title-box">
                  <h4 className="mb-0">{title}</h4>
                </div>
              </div>
            </div>
            <Navbar menuOpen={isMenuOpened} />
          </div>
        </header>
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              {children}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default HorizontalLayout
