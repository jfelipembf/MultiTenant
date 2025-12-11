# Arquitetura do Sistema Multi-Tenant - Painel Swim

Este documento descreve a arquitetura e funcionamento do sistema multi-tenant para gerenciamento de academias (branches).

---

## 📁 Estrutura de Pastas

```
├── prisma/
│   ├── schema.prisma          # Definição do banco de dados
│   ├── services/              # Serviços de acesso ao banco
│   │   ├── branch.js          # CRUD de branches (academias)
│   │   ├── customer.js        # Pagamentos e assinaturas
│   │   ├── domain.js          # Domínios customizados
│   │   └── member.js          # Membros/equipe
│   └── index.js               # Cliente Prisma singleton
│
├── src/
│   ├── components/            # Componentes React reutilizáveis
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Sidebar/
│   │       └── actions.js     # Modal de criação de branch
│   │
│   ├── config/
│   │   ├── api-validation/    # Validações de API
│   │   ├── email-templates/   # Templates de email
│   │   ├── menu/              # Configuração de menus
│   │   └── subscription-rules/ # Regras de assinatura
│   │
│   ├── hooks/
│   │   └── data/              # Hooks de dados (SWR)
│   │       ├── useBranches.js
│   │       ├── useMembers.js
│   │       └── useInvitations.js
│   │
│   ├── layouts/               # Layouts de página
│   │   ├── AccountLayout.js   # Layout autenticado
│   │   ├── AuthLayout.js      # Layout de login/registro
│   │   └── LandingLayout.js   # Layout público
│   │
│   ├── lib/
│   │   ├── common/
│   │   │   └── api.js         # Cliente HTTP para APIs
│   │   └── server/
│   │       ├── auth.js        # Configuração NextAuth
│   │       ├── mail.js        # Envio de emails
│   │       └── session-check.js # Validação de sessão
│   │
│   ├── pages/
│   │   ├── api/               # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth].js  # NextAuth handler
│   │   │   │   └── register.js       # Registro de usuário
│   │   │   ├── branch/
│   │   │   │   └── index.js   # POST criar branch
│   │   │   └── branches/
│   │   │       └── index.js   # GET listar branches
│   │   │
│   │   ├── account/           # Páginas autenticadas
│   │   │   ├── index.js       # Dashboard
│   │   │   └── [branchSlug]/  # Páginas da branch
│   │   │       ├── index.js
│   │   │       └── settings/
│   │   │
│   │   ├── auth/              # Páginas de autenticação
│   │   │   ├── login.js
│   │   │   └── register.js
│   │   │
│   │   └── _sites/            # Multi-tenant (subdomínios)
│   │       └── [site]/
│   │           └── index.js
│   │
│   ├── providers/             # Context Providers
│   │   └── branch.js          # Provider de branch selecionada
│   │
│   └── middleware.js          # Roteamento multi-tenant
```

---

## 🔐 Sistema de Autenticação

### Fluxo de Login (Email + Senha)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  /auth/login │ --> │ NextAuth API │ --> │  Prisma DB  │
│  (Frontend)  │     │CredentialsPr│     │   (users)   │
└─────────────┘     └──────────────┘     └─────────────┘
```

**Arquivo:** `src/lib/server/auth.js`

```javascript
// Configuração do NextAuth com CredentialsProvider
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // 1. Busca usuário por email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        // 2. Valida senha com bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        // 3. Retorna dados do usuário para a sessão
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => { /* adiciona dados ao token */ },
    session: async ({ session, token }) => { /* adiciona dados à sessão */ },
  },
};
```

### Registro de Usuário

**Arquivo:** `src/pages/api/auth/register.js`

```javascript
// POST /api/auth/register
export default async function handler(req, res) {
  const { name, email, password } = req.body;
  
  // 1. Valida dados
  // 2. Verifica se email já existe
  // 3. Hash da senha com bcrypt
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // 4. Cria usuário
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  
  // 5. Cria conta de pagamento (FREE)
  await prisma.customerPayment.create({
    data: { customerId: user.id, email, paymentId: `free_${user.id}` },
  });
}
```

---

## 🏢 Sistema de Branches (Academias)

### Modelo de Dados

```prisma
model Branch {
  id           String       @id @default(cuid())
  branchCode   String       @unique @default(cuid())
  inviteCode   String       @unique @default(cuid())
  creatorId    String
  name         String
  slug         String
  
  // Dados da academia
  cnpj         String?
  address      String?
  city         String?
  state        String?
  telephone    String?
  whatsapp     String?
  email        String?
  logoUrl      String?
  status       BranchStatus @default(ACTIVE)
  
  // Integração EVO
  idBranchEvo  Int?
  evoApiUser   String?
  evoApiKey    String?
  
  // Relacionamentos
  creator      User         @relation(...)
  members      Member[]
  domains      Domain[]
}
```

### Criar Branch

**API:** `POST /api/branch`

**Arquivo:** `src/pages/api/branch/index.js`

```javascript
const handler = async (req, res) => {
  // 1. Valida sessão
  const session = await validateSession(req, res);
  
  // 2. Extrai dados
  const { name, cnpj, address, city, state, telephone } = req.body;
  
  // 3. Gera slug único
  let slug = slugify(name.toLowerCase());
  
  // 4. Cria branch
  const branch = await createBranch(
    session.user.userId,
    session.user.email,
    name,
    slug,
    { cnpj, address, city, state, telephone }
  );
  
  res.status(200).json({ data: branch });
};
```

**Serviço:** `prisma/services/branch.js`

```javascript
export const createBranch = async (creatorId, email, name, slug, data = {}) => {
  // 1. Verifica se slug já existe
  const count = await countBranches(slug);
  if (count > 0) slug = `${slug}-${count}`;
  
  // 2. Cria branch com membro owner
  const branch = await prisma.branch.create({
    data: {
      creatorId,
      name,
      slug,
      ...data,
      members: {
        create: {
          email,
          inviter: email,
          status: InvitationStatus.ACCEPTED,
          teamRole: TeamRole.OWNER,
        },
      },
    },
  });
  
  return branch;
};
```

### Listar Branches

**API:** `GET /api/branches`

```javascript
const handler = async (req, res) => {
  const session = await validateSession(req, res);
  
  // Busca branches onde o usuário é membro
  const branches = await getBranches(session.user.userId, session.user.email);
  
  res.status(200).json({ data: { branches } });
};
```

---

## 💳 Sistema de Pagamentos

### Modelo de Dados

```prisma
model CustomerPayment {
  id               String           @id @default(cuid())
  paymentId        String           @unique  // ID do Stripe
  customerId       String           @unique  // ID do usuário
  email            String?          @unique
  subscriptionType SubscriptionType @default(FREE)
  
  customer User @relation(...)
}

enum SubscriptionType {
  FREE
  STANDARD
  PREMIUM
}
```

### Serviço de Pagamento

**Arquivo:** `prisma/services/customer.js`

```javascript
// Criar conta de pagamento
export const createPaymentAccount = async (email, oderId) => {
  return await prisma.customerPayment.create({
    data: {
      oderId,
      email,
      paymentId: `pay_${oderId}`,
    },
  });
};

// Buscar pagamento
export const getPayment = async (email) => {
  return await prisma.customerPayment.findUnique({
    where: { email },
  });
};
```

### Regras de Assinatura

**Arquivo:** `src/config/subscription-rules/index.js`

```javascript
const rules = {
  [SubscriptionType.FREE]: {
    features: ['1 branch', '5 membros'],
    maxBranches: 1,
    maxMembers: 5,
  },
  [SubscriptionType.STANDARD]: {
    features: ['5 branches', '50 membros'],
    maxBranches: 5,
    maxMembers: 50,
  },
  [SubscriptionType.PREMIUM]: {
    features: ['Ilimitado'],
    maxBranches: Infinity,
    maxMembers: Infinity,
  },
};
```

---

## 👥 Sistema de Membros/Equipe

### Modelo de Dados

```prisma
model Member {
  id        String           @id @default(cuid())
  branchId  String
  email     String
  inviter   String
  status    InvitationStatus @default(PENDING)
  teamRole  TeamRole         @default(MEMBER)
  
  branch    Branch @relation(...)
  member    User?  @relation(...)
  invitedBy User?  @relation(...)
}

enum InvitationStatus {
  ACCEPTED
  PENDING
  DECLINED
}

enum TeamRole {
  MEMBER
  OWNER
}
```

### Convidar Membros

```javascript
export const inviteUsers = async (id, email, members, slug) => {
  const branch = await getOwnBranch(id, email, slug);
  
  // Cria usuários (se não existirem)
  await prisma.user.createMany({
    data: members.map(({ email }) => ({ email })),
    skipDuplicates: true,
  });
  
  // Adiciona como membros da branch
  await prisma.branch.update({
    where: { id: branch.id },
    data: {
      members: {
        createMany: {
          data: members.map(({ email, role }) => ({
            email,
            inviter: email,
            teamRole: role,
          })),
        },
      },
    },
  });
};
```

---

## 🌐 Multi-Tenant (Subdomínios)

### Middleware de Roteamento

**Arquivo:** `src/middleware.js`

```javascript
const middleware = (req) => {
  const appUrl = process.env.APP_URL;
  const { host } = new URL(appUrl);
  const hostname = req.headers.get('host');
  
  // Verifica se é domínio principal
  const isMainDomain = hostname === host 
    || hostname.includes('vercel.app') 
    || hostname.includes('localhost');
  
  if (isMainDomain) {
    // Rota normal
    return NextResponse.rewrite(url);
  } else {
    // Subdomínio - redireciona para /_sites/[slug]
    const currentHost = hostname.replace(`.${host}`, '');
    url.pathname = `/_sites/${currentHost}${pathname}`;
    return NextResponse.rewrite(url);
  }
};
```

### Página do Site (Subdomínio)

**Arquivo:** `src/pages/_sites/[site]/index.js`

```javascript
export const getStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps = async ({ params }) => {
  const { site } = params;
  
  // Busca branch pelo slug ou domínio
  const branch = await getSiteBranch(site, site.includes('.'));
  
  return {
    props: { branch },
    revalidate: 10,
  };
};
```

---

## 🔌 Hooks de Dados (SWR)

### useBranches

```javascript
import useSWR from 'swr';

const useBranches = () => {
  const { data, error } = useSWR('/api/branches');
  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
  };
};
```

### Uso no Componente

```javascript
const MyComponent = () => {
  const { data, isLoading } = useBranches();
  
  if (isLoading) return <Loading />;
  
  return (
    <ul>
      {data?.branches.map(branch => (
        <li key={branch.id}>{branch.name}</li>
      ))}
    </ul>
  );
};
```

---

## 📧 Sistema de Email

### Configuração

**Arquivo:** `src/lib/server/mail.js`

```javascript
import nodemailer from 'nodemailer';

export const emailConfig = {
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

export const sendMail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport(emailConfig);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
};
```

### Templates

**Arquivo:** `src/config/email-templates/invitation.js`

```javascript
export const html = ({ code, name }) => `
  <h1>Você foi convidado!</h1>
  <p>Você foi convidado para a academia ${name}</p>
  <a href="${process.env.APP_URL}/teams/invite?code=${code}">
    Aceitar convite
  </a>
`;
```

---

## 🔒 Validação de API

### Validar Sessão

**Arquivo:** `src/lib/server/session-check.js`

```javascript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/server/auth';

const validateMiddleware = () => {
  return async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      res.status(401).json({ errors: { session: { msg: 'Unauthorized' } } });
      return;
    }
    
    return next(session);
  };
};
```

### Uso nas APIs

```javascript
import { validateSession } from '@/config/api-validation';

const handler = async (req, res) => {
  const session = await validateSession(req, res);
  if (!session) return; // Já retornou 401
  
  // Continua com a lógica...
};
```

---

## 🗄️ Variáveis de Ambiente

```env
# App
APP_URL=https://app.painelswim.com
NEXTAUTH_URL=https://app.painelswim.com
NEXTAUTH_SECRET=sua-chave-secreta

# Database (Supabase)
DATABASE_URL=postgresql://user:pass@host:6543/db?pgbouncer=true

# Email
EMAIL_FROM=noreply@painelswim.com
EMAIL_SERVICE=gmail
EMAIL_SERVER_USER=seu-email
EMAIL_SERVER_PASSWORD=sua-senha

# Stripe (Pagamentos)
NEXT_PUBLIC_PUBLISHABLE_KEY=pk_...
PAYMENTS_SECRET_KEY=sk_...
```

---

## 🚀 Fluxo Completo

```
1. Usuário acessa /auth/register
   └── Cria conta com email/senha
   └── Cria CustomerPayment (FREE)

2. Usuário faz login /auth/login
   └── NextAuth valida credenciais
   └── Retorna JWT com userId e role

3. Usuário acessa /account
   └── AccountLayout verifica sessão
   └── Carrega branches do usuário

4. Usuário cria branch
   └── POST /api/branch
   └── Cria branch + membro OWNER
   └── Redireciona para /account/[slug]

5. Usuário convida membros
   └── POST /api/branch/[slug]/invite
   └── Cria usuários + membros PENDING
   └── Envia email de convite

6. Membro aceita convite
   └── GET /teams/invite?code=xxx
   └── Atualiza status para ACCEPTED
```

---

## 📝 Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Push schema para o banco
npx prisma db push

# Rodar localmente
npm run dev

# Build
npm run build

# Deploy (push para GitHub)
git add -A && git commit -m "mensagem" && git push
```
