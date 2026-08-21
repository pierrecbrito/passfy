# 🎟️ Passfy — Plataforma de Eventos, Ingressos & Validação Criptográfica

> Uma plataforma full-stack moderna de gestão, venda concorrente, sincronização em tempo real via **WebSocket (Socket.IO)** e validação de ingressos com **QR Code anti-fraude (HMAC-SHA256)**, construída com arquitetura de **Monólito Modular**, integração oficial ao **Stripe Payment Gateway**, catálogo mundial com a **Ticketmaster Discovery API v2 (com Auto-Suggest em tempo real)**, **Spotify Web API**, curadoria com **Google Gemini AI**, geração de **Ingressos em PDF de Alta Definição**, **Devolução ao Estoque**, agendamento no **Google Agenda**, e foco rigoroso em engenharia de software e intencionalidade de design.

---

## 🧭 Sumário

1. [Visão Geral & Recursos](#-visão-geral--recursos)
2. [Arquitetura & Decisões Técnicas](#-arquitetura--decisões-técnicas)
3. [Segurança, Anti-Fraude & RBAC](#-segurança-anti-fraude--rbac)
4. [Sincronização em Tempo Real (WebSocket)](#-sincronização-em-tempo-real-websocket)
5. [Integração com Gateway de Pagamento Stripe](#-integração-com-gateway-de-pagamento-stripe)
6. [Design System & Experiência de Usuário](#-design-system--experiência-de-usuário)
7. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
8. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
9. [Credenciais de Teste Pré-semeadas](#-credenciais-de-teste-pré-semeadas)
10. [Guia de Teste Ponta a Ponta](#-guia-de-teste-ponta-a-ponta)
11. [Testes Automatizados](#-testes-automatizados)
12. [Deploy em Produção (3 Estratégias)](#-deploy-em-produção)
13. [Declaração sobre o Uso de IA](#-declaração-sobre-o-uso-de-ia)

---

## 🌟 Visão Geral & Recursos

O **Passfy** soluciona o ciclo de vida completo de eventos e ingressos através de experiências integradas (**Pública / Landing Page**, **Organizador**, **Cliente** e **Portaria**):

* 🚀 **Landing Page Corporativa & Dinâmica (`/`)**:
  * Apresentação da solução com **Hero Bento Grid de 5 cards** (estatísticas, widget de vendas com mini-gráfico, uptime e portaria segura).
  * **Grade de Serviços 3x2** com acentos em Midnight Navy e links de expansão rápida.
  * **Radar Concêntrico de Integrações**: conexões com Stripe, Google Calendar, Ticketmaster, Gemini AI e WebSockets.
  * **Planos Sob Medida** para produtores independentes e grandes arenas.
* ⚡ **Sincronização de Assentos em Tempo Real (WebSocket / Socket.IO)**:
  * Salas dinâmicas por evento (`event:${id}`).
  * Ao comprar ou devolver um assento, a disponibilidade é transmitida instantaneamente para todos os usuários com o evento aberto, sem necessidade de refresh.
  * Proteção em tempo real: se outro comprador reservar o assento que está no seu carrinho, ele é desmarcado automaticamente com aviso explicativo e retorno à Fase 1.
* 🎪 **Painel do Organizador com Ingressos Multi-Tier & Ticketmaster Auto-Suggest**:
  * **Configurador de Setores & Tipos de Ingresso**: suporte padrão a múltiplos tiers como **Pista** e **Camarote**, com preços, capacidades e subtotais dinâmicos.
  * **Busca Conectada em Tempo Real via Ticketmaster Discovery API v2 & Auto-Suggest (`/suggest.json`)**: dropdown inteligente com artistas e turnês oficiais mundiais (Coldplay, Chitãozinho & Xororó, Rock in Rio, etc.).
  * **Proteção Estrita de Acesso (RBAC)**: clientes e portaria são automaticamente barrados e redirecionados ao tentar acessar rotas do organizador.
* 🤖 **Curadoria Inteligente com Google Gemini AI**:
  * Assistente de busca em linguagem natural: o usuário informa o estilo do momento ou com quem vai sair, e a IA analisa o catálogo e recomenda a programação ideal.
* 💳 **Integração Oficial com Stripe Payment Gateway**:
  * Processamento nativo com o SDK oficial da Stripe e suporte a PIX e Cartão de Crédito.
  * **Matriz de Cartões de Teste Oficiais Stripe em 1-Clique**:
    * 🟢 **Aprovação**: `4242 4242 4242 4242`
    * 🟡 **Saldo Insuficiente**: `4000 0000 0000 0069`
    * 🔴 **Cartão Recusado/Bloqueado**: `4000 0000 0000 0002`
    * ⚪ **Cartão Expirado**: `4000 0000 0000 0127`
    * 🛡️ **Suspeita de Fraude (Stripe Radar)**: `4000 0000 0000 0082`
* 🔄 **Devolução ao Estoque pelo Cliente**:
  * Autonomia total para o comprador cancelar/devolver um ingresso válido antes da data do evento.
  * Liberação atômica da vaga/poltrona no banco de dados e disparo de atualização WebSocket em tempo real para os outros compradores.
* 📄 **Voucher em PDF de Alta Definição & Carteira Digital**:
  * Emissão de **Ingresso Oficial em PDF A4** via `jsPDF`, pronto para download e impressão, contendo:
    * Cabeçalho institucional elegante do Passfy com data de emissão.
    * Grade detalhada de informações (Comprador nominal, CPF/Documento, Evento, Local, Assento, Setor e Valor).
    * Identificação de **Meia-Entrada / Estudante** (com persistência da carteirinha para compras futuras).
    * **QR Code criptográfico em alta resolução**.
    * Selo de segurança **HMAC-SHA256** com hash de autenticidade e linha picotada de corte.
* 📷 **Portaria & Validação Criptográfica**:
  * **Leitor de Câmera em Tempo Real** via navegador (`html5-qrcode`) para leitura contínua de QR Codes.
  * **Digitação Manual de Código** como fallback imediato (ex: `PAS-DEMO1`).
  * Validação com retorno visual e alertas sonoros sintéticos (Web Audio API) nos **4 estados obrigatórios**:
    * 🟢 **Válido**: Entrada liberada e marcação atômica de uso no banco.
    * 🟡 **Já Utilizado**: Informa data/hora exata e quem realizou a validação anterior.
    * 🔵 **Evento Errado**: Ingresso autêntico, mas emitido para outra sessão/evento.
    * 🔴 **Inválido / Forjado**: Assinatura criptográfica violada ou código inexistente.
* ⚡ **Barra de Demonstração (Role Switcher)**:
  * Permite alternar instantaneamente entre Organizador, Cliente 1, Cliente 2 e Portaria com **1 clique**, com controle estrito de rotas protegidas em cada troca de perfil.

---

## 🏛️ Arquitetura & Decisões Técnicas

Optou-se por um **Monólito Modular em Camadas (Modular Layered Monolith)** estruturado em Monorepo com TypeScript estrito de ponta a ponta.

```
passfy/
├── packages/
│   ├── api/                          # Backend Node.js + Express + WebSocket + Prisma
│   │   ├── prisma/                   # Schema relacional, migrations e seeds
│   │   └── src/
│   │       ├── core/                 # Config (Zod), AppError, Prisma, WebSocket Server, HMAC Security
│   │       └── modules/
│   │           ├── ai/               # Assistente de Curadoria Google Gemini AI
│   │           ├── auth/             # Autenticação JWT e Guards de RBAC (ensureRole)
│   │           ├── catalog/          # Adapter Pattern (Ticketmaster v2 Discovery & Suggest)
│   │           ├── events/           # Gestão de eventos, setores multi-tier e assentos
│   │           ├── bookings/         # Concorrência ACID, Checkout e WebSocket Broadcast
│   │           ├── payments/         # Integração com Stripe Payment Gateway
│   │           ├── tickets/          # Emissão, Devolução ao Estoque e Link Compartilhável
│   │           └── checkin/          # Validação da Portaria e Máquina de Estados
│   │
│   └── web/                          # Frontend React 18 + Vite + Tailwind CSS + Socket.IO Client
│       └── src/
│           ├── components/           # SeatMap, TicketCard, ProtectedRoute, RoleSwitcher, SupportWidget
│           ├── contexts/             # AuthContext e Sessão
│           ├── pages/                # LandingPage, HomePage, EventDetails, MyTickets, Organizer, Gatekeeper
│           ├── services/             # Axios API Client & Socket.IO Client
│           └── utils/                # Geração de PDF (jsPDF), datas e calendários
│
├── docker-compose.prod.yml           # Orquestração de Produção (Postgres + API + Web/Nginx)
├── docker-compose.yml                # PostgreSQL local para desenvolvimento
└── .github/workflows/ci.yml          # CI Pipeline (Build + Tests)
```

---

## 🛡️ Segurança, Anti-Fraude & RBAC

1. **Prevenção de Concorrência e Double Booking**:
   * Transações ACID no PostgreSQL via `prisma.$transaction`. O update de assentos utiliza trava condicional (`WHERE id IN (...) AND isAvailable = true`). Se a quantidade de assentos atualizados diferir do total solicitado, a transação sofre rollback e retorna `409 Conflict (SEAT_ALREADY_RESERVED)`.

2. **QR Code Anti-Fraude com Assinatura HMAC-SHA256**:
   * O payload do QR Code é assinado criptograficamente com chave secreta no servidor: `base64(payload).HMAC_SHA256_Signature`. A portaria verifica a integridade matemática da assinatura antes de consultar o banco de dados.

3. **Controle Estrito de Papéis (RBAC)**:
   * **Backend**: Middleware `ensureRole(['ORGANIZER'])` nas rotas de criação e relatórios, e `ensureRole(['GATEKEEPER', 'ORGANIZER'])` na validação de portaria.
   * **Frontend**: Componente `ProtectedRoute` que redireciona clientes ou porteiros para suas áreas permitidas caso tentem acessar URLs restritas do organizador.

---

## 📡 Sincronização em Tempo Real (WebSocket)

* Servidor **Socket.IO** acoplado ao servidor HTTP da API.
* Clientes na página do evento entram automaticamente na sala `event:${eventId}`.
* Eventos disparados:
  * `seats_updated`: Transmite a lista de poltronas alteradas (`id`, `label`, `isAvailable`).
  * Atualização instantânea do mapa visual de assentos para todos os compradores conectados.

---

## 💳 Integração com Gateway de Pagamento Stripe

* Suporte completo a processamento de pagamentos com o pacote oficial `stripe`.
* Integração de ambiente de testes com cartões predefinidos em 1 clique para validação de fluxos de sucesso e exceção (saldo insuficiente, cartão bloqueado, cartão expirado e bloqueio de fraude pelo Stripe Radar).

---

## 🎨 Design System & Experiência de Usuário

* **Linguagem Visual**: Baseada no padrão *Untitled UI*, com paleta limpa e alto contraste.
* **Cores Oficiais**:
  * Cor Primária: **Azul Royal Sólido** (`#2b55f5`, hover `#1f44d6`), sem gradientes em botões e ações principais.
  * Superfícies Neutras: `#ffffff` e `slate-50`/`slate-100`.
  * Seções Escuras Institucionais: **Midnight Navy** (`#0b132b` / `#1c2541`).
* **Tipografia**: *Plus Jakarta Sans* e *Inter*.
* **Feedback Multissensorial**: Alertas sonoros sintéticos via Web Audio API e micro-animações táteis.

---

## 🛠️ Tecnologias Utilizadas

* **Backend**: Node.js 20+, Express, TypeScript, Socket.IO, Stripe SDK, Prisma ORM, PostgreSQL 16, Google Generative AI (Gemini), Zod, JWT (`jsonwebtoken`), Bcryptjs, QRCode, Crypto nativo (HMAC-SHA256), Vitest.
* **Frontend**: React 18, Vite, TypeScript, Socket.IO Client, Stripe.js, Tailwind CSS, Lucide Icons, Html5-QRCode, jsPDF, Axios.
* **APIs Externas**: Stripe API, Ticketmaster Discovery API v2, Google Gemini AI Studio, Spotify Web API, Google Calendar API format.
* **DevOps & Infra**: Docker, Docker Compose, Nginx, GitHub Actions, PM2.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js >= 20.x e npm >= 10.x
* Docker (opcional, para rodar o banco localmente)

### 1. Clonar o repositório e instalar dependências:
```bash
git clone https://github.com/pierrecbrito/passfy.git
cd passfy
npm install
```

### 2. Configurar variáveis de ambiente:
Copie o `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 3. Subir o Banco de Dados e Rodar os Seeds:
```bash
# Subir o PostgreSQL local
docker compose up -d

# Gerar o Prisma Client, aplicar migrations e semear os dados de teste
npx prisma generate --schema=packages/api/prisma/schema.prisma
npm run seed --workspace=@passfy/api
```

### 4. Iniciar a Aplicação:
```bash
# Inicia simultaneamente o Backend com WebSocket (porta 3333) e o Frontend (porta 5173)
npm run dev
```

Abra no navegador: **`http://localhost:5173`**

---

## 👥 Credenciais de Teste Pré-semeadas

Todas as contas abaixo são criadas automaticamente com a senha padrão **`password123`**:

| Perfil | Nome | E-mail | Senha | Acesso / Funcionalidade |
| :--- | :--- | :--- | :--- | :--- |
| 🎪 **Organizador** | Carlos Organizador | `organizador@passfy.com` | `password123` | Criação de eventos com Ticketmaster, Tiers e Painel |
| 👤 **Cliente 1** | Ana Silva | `cliente1@passfy.com` | `password123` | Compra de ingressos, PDF, Devolução e Google Agenda |
| 👤 **Cliente 2** | Bruno Costa | `cliente2@passfy.com` | `password123` | Teste de concorrência e compra em tempo real |
| 📷 **Portaria** | Lucas Portaria | `portaria@passfy.com` | `password123` | Leitor de câmera e validação de ingressos |

> 💡 **Dica de Avaliação**: Use a barra superior **Role Switcher** na interface para alternar entre qualquer um desses usuários com **1 único clique**!

---

## 🧪 Guia de Teste Ponta a Ponta

1. **Explorar a Landing Page (`/`)**:
   - Visualize o Hero Bento Grid de 5 cards, a grade escura de serviços e o mapa de radar concêntrico.
2. **Curadoria com Inteligência Artificial (`/home`)**:
   - Digite no assistente de IA: *"Quero ir para um show de rock com meus amigos"* e veja as recomendações personalizadas em tempo real.
3. **Criação de Eventos Multi-Tier (`/organizer/create`)**:
   - Alterne para o perfil **Organizador**.
   - Digite `Coldplay` ou `Rock` e use o auto-complete da Ticketmaster.
   - Configure setores como **Pista** e **Camarote** com valores e capacidades independentes.
4. **Compra Concorrente & Sincronização em Tempo Real (WebSocket)**:
   - Abra o evento em duas abas (uma com Ana e outra com Bruno).
   - Ao comprar uma poltrona na Aba 1, veja a poltrona ficar ocupada instantaneamente na Aba 2 via WebSocket!
5. **Checkout com Gateway Stripe Oficial**:
   - Na Fase 3 do checkout, selecione **Cartão de Crédito**.
   - Teste clicar em `🟡 Sem Saldo` ou `🔴 Recusado` para ver o tratamento de erro oficial da Stripe.
   - Clique em `🟢 Aprovação` e confirme a compra.
6. **Download do PDF & Agendamento no Google Agenda**:
   - Acesse a página de confirmação de pedido ou **Meus Ingressos**.
   - Baixe o voucher em PDF de alta definição com QR Code e selo HMAC.
7. **Devolução ao Estoque**:
   - Na tela **Meus Ingressos**, clique em **Devolver ao Estoque**.
   - Confirme a devolução e observe a poltrona voltar a ficar verde e disponível para venda em tempo real em outras janelas.
8. **Validação na Portaria**:
   - Alterne para o perfil **Portaria** e valide ingressos pela câmera ou com o código `PAS-DEMO1`.

---

## 🔬 Testes Automatizados

Para rodar a suíte completa de testes automatizados:

```bash
npm run test --workspace=@passfy/api
```

---

## 🌐 Deploy em Produção

O projeto está configurado para deploy através de **3 estratégias**:

### Opção 1: Deploy com Docker Compose (Recomendado para VPS / Servidores)
```bash
# 1. Configurar variáveis no .env
# 2. Iniciar todos os containers (PostgreSQL + API com WebSocket + Web com Nginx)
docker compose -f docker-compose.prod.yml up -d --build

# 3. Executar migrações
docker compose -f docker-compose.prod.yml exec api npx prisma db push
docker compose -f docker-compose.prod.yml exec api npm run seed
```

### Opção 2: Plataformas Cloud Gerenciadas (PaaS)
* **Banco de Dados**: [Supabase](https://supabase.com) ou [Neon.tech](https://neon.tech) (PostgreSQL Serverless).
* **Backend API & WebSocket**: [Railway.app](https://railway.app) ou [Render.com](https://render.com) (Node.js + WebSockets).
* **Frontend Web**: [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (SPA com Vite).

### Opção 3: VPS Linux Tradicional (Ubuntu + PM2 + Nginx + Certbot SSL)
Utilize o build de produção `npm run build` gerenciado via **PM2** e Nginx com proxy reverso para `/api` e `/socket.io`.

---

## 🤖 Declaração sobre o Uso de IA

O desenvolvimento deste projeto utilizou Inteligência Artificial como uma ferramenta aceleradora de produtividade e pair programming. A condução do projeto foi orientada por critérios humanos rigorosos de engenharia de software:

* **Arquitetura & Engenharia**: Monólito modular com TypeScript estrito, concorrência atômica ACID no banco relacional e protocolo de emissão e broadcast WebSocket em tempo real.
* **Segurança Anti-Fraude**: Assinatura criptográfica HMAC-SHA256 e controle estrito de RBAC em rotas e interfaces.
* **Integrações Oficiais**: Ticketmaster Discovery API v2 com Auto-Suggest, Stripe Payment Gateway oficial, Google Gemini AI e Spotify Web API.

---

### Licença
Distribuído sob a licença MIT. Desenvolvido com dedicação por **Pierre Brito**.
