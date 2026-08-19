# 🎟️ Passfy — Plataforma de Eventos, Ingressos & Validação Criptográfica

> Uma plataforma full-stack de gestão, venda concorrente e validação de ingressos em tempo real com QR Code anti-fraude, construída com arquitetura de **Monólito Modular**, integração oficial à **Ticketmaster Discovery API v2 (com Auto-Suggest em tempo real)**, **Spotify Web API**, geração de **Ingressos em PDF de Alta Definição**, agendamento no **Google Agenda**, e foco rigoroso em engenharia de software e intencionalidade de design.

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

* 🚀 **Landing Page Corporativa & Dinâmica (`/`)**:
  * Apresentação da solução com **hero split**, fotografia em alta definição, badges flutuantes de estatísticas ao vivo e carrossel navegável de eventos.
  * **Faixa Marquee contínua de parceiros oficiais**: Ticketmaster, Spotify, Google Maps, Google Calendar, Apple Wallet, Visa, Mastercard, Pix.
  * **Seção escura de métricas** com contadores e selos de segurança.
  * **Navegação com rolagem suave inteligente** (*smooth scroll* com cálculo dinâmico de offset do cabeçalho fixo).
* 🎪 **Painel do Organizador com Autocomplete em Tempo Real da Ticketmaster**:
  * **Busca Conectada em Tempo Real via Ticketmaster Discovery API v2 & Auto-Suggest (`/suggest.json`)**: conforme o organizador digita o título do evento (ex: `Chitão`, `Cold`, `Jot`, `Rock`), um dropdown inteligente apresenta os eventos oficiais disponíveis no catálogo mundial.
  * Ao selecionar uma sugestão, preenche instantaneamente título oficial, descrição, foto de capa em alta resolução (16:9), arena/local, categoria e data da apresentação.
  * Liberdade total para **continuar com preenchimento manual** quando desejado.
  * Criação de eventos com **grade interativa de assentos numerados** (cinema/teatro com fileiras A–L) ou **pista geral com capacidade configurável**.
  * Métricas em tempo real de ocupação, ingressos vendidos e receita bruta no Dashboard.
* 🎵 **Player Integrado Spotify Web API na Página do Evento**:
  * Em eventos musicais, carrega dinamicamente o widget oficial do **Spotify** com as faixas mais tocadas e setlists do artista para aquecimento do público antes da compra.
* 👤 **Experiência do Cliente & Checkout Simulado**:
  * Catálogo de eventos com busca em tempo real e filtros de categoria (Shows, Festivais, Teatro).
  * **Mapa de Assentos Interativo** em tempo real com prevenção instantânea de concorrência (*double booking*).
  * **Fluxo Dinâmico de Pré-Cadastro na Página do Evento**: se o usuário estiver deslogado ao selecionar assentos, o card de resumo se transforma (*in-place flip*) no formulário de autenticação rápida, sem perder os assentos selecionados.
  * **Simulação Completa de Gateway de Pagamento** (Pix ou Cartão) com alternador interativo para simular **Aprovação Imediata** ou **Recusa Proposital** (Saldo Insuficiente, Cartão Bloqueado, etc.).
  * 📅 **Agendamento Automático no Google Agenda**: após a confirmação da compra, abre automaticamente uma nova aba com o evento pré-configurado no Google Calendar (título, data, horário e localização), com botão de reabertura persistente.
* 📄 **Voucher em PDF de Alta Definição & Carteira Digital**:
  * Emissão de **Ingresso Oficial em PDF A4** via `jsPDF`, pronto para download e impressão, contendo:
    * Cabeçalho institucional elegante do Passfy com data de emissão.
    * Grade detalhada de informações (Comprador nominal, CPF/Documento, Evento, Local, Assento, Setor e Valor).
    * Selo para identificação de **Meia-Entrada / Estudante**.
    * **QR Code criptográfico em alta resolução**.
    * Selo de segurança **HMAC-SHA256** com hash de autenticidade e linha pontilhada picotada de corte.
  * Carteira digital no formato *Apple Wallet Pass*, com link público compartilhável e visualização segura.
* 📷 **Portaria & Validação Criptográfica**:
  * **Leitor de Câmera em Tempo Real** via navegador (`html5-qrcode`) para leitura contínua de QR Codes.
  * **Digitação Manual de Código** como fallback imediato (ex: `PAS-DEMO1`).
  * Validação com retorno visual e alertas sonoros sintéticos (Web Audio API) nos **4 estados obrigatórios**:
    * 🟢 **Válido**: Entrada liberada e marcação atômica de uso no banco.
    * 🟡 **Já Utilizado**: Informa data/hora exata e quem realizou a validação anterior.
    * 🔵 **Evento Errado**: Ingresso autêntico, mas emitido para outra sessão/evento.
    * 🔴 **Inválido / Forjado**: Assinatura criptográfica violada ou código inexistente.
* ⚡ **Barra de Demonstração (Role Switcher)**:
  * Permite alternar instantaneamente entre Organizador, Cliente 1, Cliente 2 e Portaria com **1 clique**, sem atrito de login/logout manual.

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
│   │           ├── catalog/          # Adapter Pattern (Ticketmaster v2 Discovery & Suggest)
│   │           ├── events/           # Gestão de eventos e geração de assentos
│   │           ├── bookings/         # Concorrência e Checkout Simulado
│   │           ├── tickets/          # Emissão de ingressos, PDF e link compartilhável
│   │           └── checkin/          # Validação da Portaria e Máquina de Estados
│   │
│   └── web/                          # Frontend React 18 + Vite + Tailwind CSS
│       └── src/
│           ├── components/           # SeatMap, TicketCard, RoleSwitcher, CheckoutModal, UI
│           ├── contexts/             # AuthContext e Sessão
│           ├── pages/                # LandingPage, HomePage, EventDetails, Organizer, Gatekeeper
│           ├── services/             # Axios API Client com interceptors
│           └── utils/                # Geração de PDF (jsPDF), datas e calendários
│
├── docker-compose.yml                # PostgreSQL 16 local
└── .github/workflows/ci.yml          # CI Pipeline (Build + Tests)
```

### 1. Prevenção de Concorrência e Double Booking
* **Desafio**: Impedir que dois clientes comprem a mesma poltrona no mesmo milissegundo.
* **Solução**: Transações ACID no PostgreSQL via `prisma.$transaction`. A query de reserva executa um update atômico com trava condicional (`WHERE id IN (...) AND isAvailable = true`). Se o número de registros alterados diferir da quantidade solicitada, a transação aborta e retorna um `409 Conflict (SEAT_ALREADY_RESERVED)`.

### 2. QR Code Anti-Fraude com Assinatura HMAC-SHA256
* **Desafio**: Impedir que um usuário forje um QR Code alterando IDs ou gerando códigos aleatórios.
* **Solução**: O payload do QR Code é assinado criptograficamente com uma chave secreta no servidor: `base64(payload).HMAC_SHA256_Signature`. A portaria verifica a integridade da assinatura antes de consultar o banco.

### 3. Integração Ticketmaster Discovery API v2 & Auto-Suggest
* Implementação resiliente via `TicketmasterCatalogProvider` com suporte a buscas por keyword, auto-suggest em tempo real (`/suggest.json`), fallback para normalização de acentuação (*ex: Chitãozinho -> Chitaozinho*) e dataset de fallback offline resiliente para testes sem internet.

---

## 🎨 Design System & Experiência de Usuário

* **Linguagem Visual**: Inspirada no padrão *Untitled UI* com estética clara, minimalista e corporativa.
* **Paleta de Cores**: Fundo branco puro (`#ffffff`), superfícies em tons neutros (`slate-50`/`slate-100`), bordas nítidas (`border-slate-200`) e cor primária oficial em **Azul Elétrico Royal** (`#2b55f5`, hover `#1f44d6`).
* **Tipografia**: *Plus Jakarta Sans* e *Inter* com hierarquia tipográfica equilibrada.
* **Micro-animações**: Marquee infinito de parceiros, animações de entrada com Tailwind, e feedback tátil/sonoro na portaria.

---

## 🛠️ Tecnologias Utilizadas

* **Backend**: Node.js 22, Express, TypeScript, Prisma ORM, PostgreSQL 16, Zod, JWT (`jsonwebtoken`), Bcryptjs, QRCode, Crypto nativo (HMAC-SHA256), Vitest.
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Html5-QRCode, jsPDF, Axios.
* **APIs Externas**: Ticketmaster Discovery API v2, Spotify Web API, Google Calendar API format, Google Maps Embed.
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
| 🎪 **Organizador** | Carlos Organizador | `organizador@passfy.com` | `password123` | Criação de eventos com Ticketmaster e Painel |
| 👤 **Cliente 1** | Ana Silva | `cliente1@passfy.com` | `password123` | Compra de ingressos, PDF e Google Calendar |
| 👤 **Cliente 2** | Bruno Costa | `cliente2@passfy.com` | `password123` | Teste de concorrência e compra |
| 📷 **Portaria** | Lucas Portaria | `portaria@passfy.com` | `password123` | Leitor de câmera e validação de ingressos |

> 💡 **Dica de Avaliação**: Use a barra superior **Role Switcher** na interface para alternar entre qualquer um desses usuários com **1 único clique** sem precisar digitar e-mail e senha!

---

## 🧪 Guia de Teste Ponta a Ponta

Para validar o fluxo completo do Passfy:

1. **Explorar a Landing Page**:
   * Acesse `http://localhost:5173/` e navegue pelas seções animadas usando os links suaves no cabeçalho (*Eventos*, *Organizadores*, *Compradores*, *Portaria*).
2. **Explorar Eventos & Player do Spotify**:
   * Clique em qualquer evento do carrossel ou em **"Explorar eventos"** (`/home`).
   * Na página de detalhes do evento, experimente o **player dinâmico do Spotify** integrado com as faixas mais tocadas do artista.
3. **Publicar Novo Evento com Autocomplete Ticketmaster**:
   * Alterne para o perfil **Organizador** no topo.
   * Acesse **"Criar Evento"** (`/organizer/create`).
   * No campo **Título do Evento**, comece a digitar o nome de um artista (ex: `Chitãozinho`, `Coldplay`, `Jot`, `Taylor Swift`).
   * Selecione uma sugestão do dropdown e veja o formulário auto-preenchido com título, descrição, banner cinematográfico em alta definição, arena e data oficial.
4. **Fluxo de Pré-Cadastro & Reserva de Assento**:
   * Deslogue ou abra um evento em aba anônima.
   * Selecione poltronas no mapa interativo e clique em **"Garantir Ingresso"**.
   * Observe o card lateral transformar-se no **formulário de pré-cadastro em tempo real**; conclua o cadastro sem sair da página e veja o modal de checkout abrir automaticamente.
5. **Checkout, Pagamento Simulado & Google Agenda**:
   * Experimente testar **"Simular Recusa"** (ex: Saldo Insuficiente) e depois confirme com **"Forçar Aprovação"** via Pix ou Cartão.
   * Observe a **abertura automática da aba do Google Agenda** com o evento pronto para agendamento!
6. **Voucher em PDF de Alta Definição & Compartilhamento**:
   * Acesse **"Meus Ingressos"** e clique em **"Baixar Ingresso (PDF)"**.
   * Veja o PDF A4 gerado com QR Code nítido, selo HMAC-SHA256 e linha picotada.
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
* `ticketmaster.spec.ts`: Valida o provider da Ticketmaster Discovery API v2, auto-suggest, mapeamento de campos e resiliência com fallback offline.

---

## 🤖 Declaração sobre o Uso de IA

O desenvolvimento deste projeto utilizou Inteligência Artificial como uma ferramenta aceleradora de produtividade e pair programming. A condução do projeto, no entanto, foi orientada por critérios humanos rigorosos de engenharia de software para **evitar o "AI slop" (interfaces e códigos genéricos sem critério)**:

1. **Onde a IA foi utilizada**:
   * Auxílio na geração de boilerplate inicial de tipagens e na aceleração da escrita das suítes de teste automatizado.
   * Apoio na estruturação sintática dos componentes React e consultas do Prisma.
2. **Decisões Técnicas e Arquiteturais tomadas pelo Desenvolvedor**:
   * Escolha da arquitetura de **Monólito Modular** com TypeScript estrito, alinhando a solução aos requisitos da vaga e facilitando a concorrência atômica.
   * Implementação do **bloqueio atômico de assentos (Pessimistic Lock)** no banco relacional para solucionar de forma determinística o problema de *race conditions*.
   * Desenho do mecanismo de **assinatura criptográfica HMAC-SHA256** no payload do QR Code para garantir anti-fraude real.
   * Integração em tempo real com **Ticketmaster Discovery API v2 & Auto-Suggest** e **Spotify Web API**.
   * Criação do gerador nativo de **PDFs de Alta Definição** para vouchers de ingresso com jsPDF e integração com **Google Agenda**.
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
