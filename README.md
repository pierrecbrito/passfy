# 🎟️ Passfy — Plataforma de Eventos, Ingressos & Validação Criptográfica

> Projeto desenvolvido para o **Desafio Elite Dev da Verzel**.  
> Uma plataforma full-stack completa de gestão, venda concorrente e validação de ingressos em tempo real com QR Code anti-fraude, construída com arquitetura de **Monólito Modular**, integração oficial à **Ticketmaster Discovery API v2 & TMDb**, e foco rigoroso em engenharia de software e intencionalidade de design.

---

## 🧭 Sumário

1. [Visão Geral & Recursos](#-visão-geral--recursos)
2. [Arquitetura & Decisões Técnicas](#-arquitetura--decisões-técnicas)
3. [Design System & Experiência de Usuário](#-design-system--experiência-de-usuário)
4. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
5. [Como Executar o Projeto](#-como-executar-o-projeto)
6. [Credenciais de Teste Pré-semeadas](#-credenciais-de-teste-pré-semeadas)
7. [Guia de Teste Ponta a Ponta](#-guia-de-teste-ponta-a-ponta)
8. [Testes Automatizados](#-testes-automatizados)
9. [Declaração sobre o Uso de IA](#-declaração-sobre-o-uso-de-ia)
10. [Deploy em Produção](#-deploy-em-produção)

---

## 🌟 Visão Geral & Recursos

O **Passfy** soluciona o ciclo de vida completo de eventos e ingressos através de experiências integradas (**Pública / Landing Page**, **Organizador**, **Cliente** e **Portaria**):

* 🚀 **Landing Page Minimalista & Animada (`/`)**:
  * Apresentação da solução com **hero animado**, floating tickets em movimento contínuo e micro-interações de alta fidelidade.
  * **Navegação com rolagem suave inteligente** (*smooth scroll* com cálculo dinâmico de offset do cabeçalho fixo).
  * Seções de estatísticas de alta disponibilidade, catálogo de funcionalidades, passo a passo, carteira digital estilo Apple Wallet, demonstração visual da portaria e depoimentos.
* 🎪 **Painel do Organizador & Catálogo Multi-Provedor**:
  * **Integração Oficial com a Ticketmaster Discovery API v2**: busca global de atrações, shows e festivais em tempo real com preenchimento automático de títulos, locais, datas e banners em alta definição.
  * **Integração com TMDb API**: busca e importação instantânea de filmes e pré-estreias de cinema.
  * Criação de eventos com **grade interativa de assentos numerados** (cinema/teatro com fileiras A–F) ou **pista geral por quantidade**.
  * Métricas em tempo real de ocupação, ingressos vendidos e receita bruta.
* 👤 **Experiência do Cliente & Pré-Cadastro In-Place**:
  * Catálogo de eventos (`/home`) com busca em tempo real e filtros de categoria (Shows, Cinema, Teatro).
  * **Mapa de Assentos Interativo** em tempo real com prevenção instantânea de concorrência (*double booking*).
  * **Fluxo Dinâmico de Pré-Cadastro na Página do Evento**: se o usuário estiver deslogado ao selecionar assentos, o card de resumo se transforma (*in-place flip*) no formulário de pré-cadastro/login rápido, autentica em segundos e abre imediatamente o checkout sem recarregar a página ou perder o contexto.
  * **Checkout Simulado Completo** (Pix ou Cartão) com alternador interativo para simular **Aprovação Imediata** ou **Recusa Proposital** (Saldo Insuficiente, Cartão Bloqueado, etc.).
  * Carteira de **Meus Ingressos Digitais** no formato *Apple Wallet Pass*, com cortes tracejados, QR Code em alta definição e botão de **compartilhamento público por link seguro**.
* 📷 **Portaria & Validação de Entrada**:
  * **Leitor de Câmera em Tempo Real** via navegador para leitura contínua de QR Codes.
  * **Digitação Manual de Código** como fallback imediato (ex: `PAS-DEMO1`).
  * Validação criptográfica com retorno visual e alertas sonoros sintéticos (Web Audio API) nos **4 estados obrigatórios**:
    * 🟢 **Válido**: Entrada liberada e marcação atômica de uso.
    * 🟡 **Já Utilizado**: Informa data/hora e quem realizou a validação anterior.
    * 🔵 **Evento Errado**: Ingresso autêntico, mas emitido para outra sessão.
    * 🔴 **Inválido / Forjado**: Assinatura criptográfica violada ou código inexistente.
* ⚡ **Barra de Demonstração (Role Switcher)**:
  * Permite ao avaliador alternar instantaneamente entre Organizador, Cliente 1, Cliente 2 e Portaria com **1 clique**, sem atrito de login/logout manual.

---

## 🏛️ Arquitetura & Decisões Técnicas

Optou-se por um **Monólito Modular em Camadas (Modular Layered Monolith)** estruturado em Monorepo com TypeScript estrito de ponta a ponta.

```
passfy/
├── packages/
│   ├── api/                          # Backend Node.js + Express + Prisma
│   │   ├── prisma/                   # Schema relacional, migrations e seeds
│   │   └── src/
│   │       ├── core/                 # Config (Zod), AppError, Prisma, HMAC Security
│   │       └── modules/
│   │           ├── auth/             # Autenticação JWT e Guards de RBAC
│   │           ├── catalog/          # Adapter Pattern (Ticketmaster v2 + TMDb)
│   │           ├── events/           # Gestão de eventos e geração de assentos
│   │           ├── bookings/         # Concorrência e Checkout Simulado
│   │           ├── tickets/          # Emissão de ingressos e link compartilhável
│   │           └── checkin/          # Validação da Portaria e Máquina de Estados
│   │
│   └── web/                          # Frontend React 18 + Vite + Tailwind CSS
│       └── src/
│           ├── components/           # SeatMap, TicketCard, RoleSwitcher, CheckoutModal, UI
│           ├── contexts/             # AuthContext e Sessão
│           ├── pages/                # LandingPage, HomePage, EventDetails, Organizer, Gatekeeper
│           └── services/             # Axios API Client com interceptors
│
├── docker-compose.yml                # PostgreSQL 16 local
└── .github/workflows/ci.yml          # CI Pipeline (Build + Tests)
```

### 1. Prevenção de Concorrência e Double Booking
* **Desafio**: Impedir que dois clientes comprem a mesma poltrona no mesmo milissegundo.
* **Solução**: Transações ACID no PostgreSQL via `prisma.$transaction`. A query de reserva executa um update atômico com trava condicional (`WHERE id IN (...) AND isAvailable = true`). Se o número de registros alterados diferir da quantidade solicitada, a transação aborta e retorna um `409 Conflict (SEAT_ALREADY_RESERVED)`.

### 2. QR Code Anti-Fraude com Assinatura HMAC-SHA256
* **Desafio**: Impedir que um usuário forje um QR Code alterando IDs ou gerando códigos aleatórios.
* **Solução**: O payload do QR Code não contém apenas dados abertos. Ele é gerado como um token assinado criptograficamente com uma chave secreta no servidor: `base64(payload).HMAC_SHA256_Signature`. A portaria verifica a integridade da assinatura antes de consultar o banco.

### 3. Multi-Provider Catalog Adapter (Ticketmaster Discovery API v2 & TMDb)
* A interface `ICatalogProvider` define o contrato unificado de busca e detalhes.
* A implementação `TicketmasterCatalogProvider` consome o endpoint `https://app.ticketmaster.com/discovery/v2/events.json` com paginação, filtros e dataset de fallback offline resiliente para avaliação contínua.
* A implementação `TmdbCatalogProvider` comunica-se com a API do TMDb para eventos de cinema.

---

## 🎨 Design System & Experiência de Usuário

* **Linguagem Visual**: Inspirada no padrão *Untitled UI* com estética clara, minimalista e premium.
* **Paleta de Cores**: Fundo branco puro (`#ffffff`), superfícies em tons neutros (`slate-50`/`slate-100`), bordas nítidas (`border-slate-200`) e cor primária oficial em **Azul Elétrico Royal** (`#2b55f5`, hover `#1f44d6`).
* **Tipografia**: *Plus Jakarta Sans* e *Inter* com hierarquia de peso e espaçamento de linha balanceado.
* **Micro-animações**: Intersecção observada para animações de entrada (*fade up*, *slide in*), floating ticket stack na tela de login e hero, e feedback tátil/sonoro na portaria.

---

## 🛠️ Tecnologias Utilizadas

* **Backend**: Node.js 22, Express, TypeScript, Prisma ORM, PostgreSQL 16, Zod, JWT (`jsonwebtoken`), Bcryptjs, QRCode, Crypto nativo (HMAC-SHA256), Vitest.
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Html5-QRCode, Axios.
* **APIs Externas**: Ticketmaster Discovery API v2, The Movie Database (TMDb) API.
* **Infraestrutura**: Docker Compose, GitHub Actions, Vercel (Frontend), Render/Neon (Backend & Database).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js >= 20.x e npm >= 10.x
* Docker (opcional, para rodar o banco localmente)

### 1. Clonar o repositório e instalar dependências:
```bash
git clone https://github.com/SEU_USUARIO/passfy.git
cd passfy
npm install
```

### 2. Configurar variáveis de ambiente:
Copie o `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 3. Subir o Banco de Dados e Rodar os Seeds:
Com o Docker ativo:
```bash
# Subir o PostgreSQL
docker compose up -d

# Gerar o Prisma Client, aplicar migrations e semear os dados de teste
npx prisma generate --schema=packages/api/prisma/schema.prisma
npm run seed --workspace=@passfy/api
```

*(Caso utilize um banco PostgreSQL em nuvem como Neon ou Supabase, basta colar a `DATABASE_URL` no arquivo `.env` e rodar o comando de seed acima).*

### 4. Iniciar a Aplicação:
```bash
# Inicia simultaneamente o Backend (porta 3333) e o Frontend (porta 5173)
npm run dev
```

Abra no navegador: **`http://localhost:5173`**

---

## 👥 Credenciais de Teste Pré-semeadas

Todas as contas abaixo são criadas automaticamente pelo script de seed com a senha padrão **`password123`**:

| Perfil | Nome | E-mail | Senha | Acesso / Funcionalidade |
| :--- | :--- | :--- | :--- | :--- |
| 🎪 **Organizador** | Carlos Organizador | `organizador@passfy.com` | `password123` | Criação de eventos com Ticketmaster/TMDb e Painel |
| 👤 **Cliente 1** | Ana Silva | `cliente1@passfy.com` | `password123` | Compra de ingressos e visualização |
| 👤 **Cliente 2** | Bruno Costa | `cliente2@passfy.com` | `password123` | Teste de concorrência e compra |
| 📷 **Portaria** | Lucas Portaria | `portaria@passfy.com` | `password123` | Leitor de câmera e validação de ingressos |

> 💡 **Dica de Avaliação**: Use a barra superior **Role Switcher** na interface para alternar entre qualquer um desses usuários com **1 único clique** sem precisar digitar e-mail e senha!

---

## 🧪 Guia de Teste Ponta a Ponta

Para validar o fluxo completo conforme solicitado no edital:

1. **Explorar a Landing Page**:
   * Acesse `http://localhost:5173/` e navegue pelas seções animadas usando os links suaves no cabeçalho (*Funcionalidades*, *Como Funciona*, *Categorias*).
2. **Explorar Eventos**:
   * Clique em **"Explorar eventos"** para acessar o catálogo (`/home`) com shows da Ticketmaster e sessões de cinema.
3. **Publicar Novo Evento com Ticketmaster / TMDb**:
   * Alterne para o perfil **Organizador** no topo.
   * Acesse **"Criar Evento"** -> **"Importar do Catálogo"**.
   * Escolha a aba **Ticketmaster** (ex: *Rock in Rio*, *Coldplay*, *Taylor Swift*) ou **TMDb**, selecione e veja o formulário auto-preenchido com posters reais e mapa de assentos configurável.
4. **Fluxo de Pré-Cadastro & Reserva de Assento**:
   * Deslogue ou abra um evento em aba anônima.
   * Selecione poltronas no mapa interativo e clique em **"Garantir Ingresso"**.
   * Observe o card lateral transformar-se no **formulário de pré-cadastro em tempo real**; conclua o cadastro sem sair da página e veja o modal de checkout abrir automaticamente.
5. **Checkout & Pagamento Simulado**:
   * Experimente testar **"Simular Recusa"** (ex: Saldo Insuficiente) e depois confirme com **"Forçar Aprovação"** via Pix ou Cartão.
6. **Ingressos Digitais & Compartilhamento**:
   * Acesse **"Meus Ingressos"** e veja o pass emitido no formato *Apple Wallet* com QR Code criptografado.
   * Clique em **"Compartilhar Link"** e abra em uma janela anônima para comprovar a visualização pública.
7. **Validação na Portaria**:
   * Alterne para o perfil **Portaria** e acesse a tela do scanner.
   * Valide com a câmera ou digite o código de teste semeado **`PAS-DEMO1`**:
     * 1ª leitura: 🟢 **Entrada Autorizada** (com retorno sonoro).
     * 2ª leitura do mesmo código: 🟡 **Ingresso Já Utilizado** (com histórico de data/hora).
     * Código inexistente ou forjado: 🔴 **Ingresso Inválido**.

---

## 🔬 Testes Automatizados

Para rodar a suíte completa de testes automatizados:

```bash
npm run test --workspace=@passfy/api
```

### Cobertura de Testes Chave:
* `concurrency.spec.ts`: Simula requisições simultâneas disputando a mesma poltrona e valida que apenas uma tem sucesso e a outra recebe `409 Conflict`.
* `checkin.spec.ts`: Valida os 4 estados da portaria (Válido, Já Usado, Evento Errado, Assinatura Forjada/Inválida).
* `ticketmaster.spec.ts`: Valida o provider da Ticketmaster Discovery API v2, mapeamento de campos e resiliência com fallback offline.

---

## 🤖 Declaração sobre o Uso de IA

*Atendendo à solicitação explícita do edital do Desafio Elite Dev:*

O desenvolvimento deste projeto utilizou Inteligência Artificial como uma ferramenta aceleradora de produtividade e pair programming. A condução do projeto, no entanto, foi orientada por critérios humanos rigorosos de engenharia de software para **evitar o "AI slop" (interfaces e códigos genéricos sem critério)**:

1. **Onde a IA foi utilizada**:
   * Auxílio na geração de boilerplate inicial de tipagens e na aceleração da escrita das suítes de teste automatizado.
   * Apoio na estruturação sintática dos componentes React e consultas do Prisma.
2. **Decisões Técnicas e Arquiteturais tomadas pelo Desenvolvedor**:
   * Escolha da arquitetura de **Monólito Modular** com TypeScript estrito, alinhando a solução aos requisitos da vaga e facilitando a concorrência atômica.
   * Implementação do **bloqueio atômico de assentos (Pessimistic Lock)** no banco relacional para solucionar de forma determinística o problema de *race conditions*.
   * Desenho do mecanismo de **assinatura criptográfica HMAC-SHA256** no payload do QR Code para garantir anti-fraude real.
   * Integração de múltiplos provedores de catálogo (**Ticketmaster Discovery v2** e **TMDb**) com Adapter Pattern e fallback offline.
   * Criação do componente **Role Switcher** na UI para eliminar o atrito do avaliador durante o percurso dos fluxos.
   * Modelagem intencional da interface no padrão *Untitled UI*, com paleta clara, tipografia moderna (*Plus Jakarta Sans*), micro-interações e feedback auditivo via Web Audio API.

---

## 🌐 Deploy em Produção

* **Frontend (Vercel)**: `https://passfy.vercel.app` *(ou URL fornecida na entrega)*
* **Backend (Render / Railway)**: `https://passfy-api.onrender.com`
* **Banco de Dados (PostgreSQL)**: Neon Serverless Database

---

### Licença
Distribuído sob a licença MIT. Desenvolvido com dedicação por **Pierre Brito**.
