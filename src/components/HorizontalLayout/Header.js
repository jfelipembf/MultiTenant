import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from 'next-auth/react'

const Header = ({ isMenuOpened, openLeftMenuCallBack }) => {
  const { data } = useSession();

  return (
    <React.Fragment>
      <div className="navbar-header">
        <div className="container-fluid">
          <div className="float-start">
            <div className="navbar-brand-box">
              <Link href="/account" className="logo logo-dark">
                <span className="logo-lg">
                  <Image
                    src="/images/logoswim.png"
                    alt="Painel Swim"
                    width={100}
                    height={25}
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </span>
              </Link>
            </div>
            <button
              type="button"
              className="btn btn-sm px-3 font-size-24 d-lg-none header-item waves-effect waves-light"
              data-toggle="collapse"
              onClick={openLeftMenuCallBack}
              data-target="#topnav-menu-content"
            >
              <i className="mdi mdi-menu"></i>
            </button>
          </div>

          <div className="float-end">
            {/* User name */}
            <div className="dropdown d-inline-block">
              <button
                type="button"
                className="btn header-item waves-effect"
              >
                <span className="d-none d-xl-inline-block ms-1">
                  {data?.user?.name || data?.user?.email}
                </span>
              </button>
            </div>
            {/* Logout */}
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
      </div>
    </React.Fragment>
  )
}

export default Header
