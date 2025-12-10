import { NextResponse } from 'next/server';

const middleware = (req) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { host } = new URL(appUrl);
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');
  const currentHost = hostname.replace(`.${host}`, '');

  // Debug log - remover depois
  console.log('[Middleware]', { hostname, host, pathname, currentHost });

  if (pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  if (!pathname.includes('.') && !pathname.startsWith('/api')) {
    // Considera como domínio principal: o host configurado OU domínios da Vercel
    const isMainDomain = hostname === host || hostname.includes('vercel.app');

    if (isMainDomain) {
      url.pathname = `${pathname}`;
    } else {
      url.pathname = `/_sites/${currentHost}${pathname}`;
    }

    return NextResponse.rewrite(url);
  }
};

export default middleware;
