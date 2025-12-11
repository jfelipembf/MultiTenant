import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

const middleware = (req) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const { host } = new URL(appUrl);
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');

  // Extrai o subdomínio (ex: "academia-teste" de "academia-teste.painelswim.com")
  const rootDomain = 'painelswim.com';
  const isSubdomain = hostname.endsWith(`.${rootDomain}`) && !hostname.startsWith('app.');
  const subdomain = isSubdomain ? hostname.replace(`.${rootDomain}`, '') : null;

  if (pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  if (!pathname.includes('.') && !pathname.startsWith('/api')) {
    // Considera como domínio principal: app.painelswim.com, domínios da Vercel ou localhost
    const isMainDomain =
      hostname === host ||
      hostname.startsWith('app.') ||
      hostname.includes('vercel.app') ||
      hostname.includes('localhost');

    if (isMainDomain) {
      url.pathname = `${pathname}`;
    } else if (subdomain) {
      // Subdomínio da academia - redireciona para /_sites/[slug]
      url.pathname = `/_sites/${subdomain}${pathname}`;
    }

    return NextResponse.rewrite(url);
  }
};

export default middleware;
