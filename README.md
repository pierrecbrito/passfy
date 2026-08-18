# 🎟️ Passfy — Plataforma de Eventos, Ingressos & Validação Criptográfica

> Projeto desenvolvido para o **Desafio Elite Dev da Verzel**.  
> Uma plataforma full-stack completa de gestão, venda concorrente e validação de ingressos em tempo real com QR Code anti-fraude, construída com arquitetura de **Monólito Modular** e foco rigoroso em engenharia de software e intencionalidade de design.

---

## 🧭 Sumário

1. [Visão Geral & Recursos](#-visão-geral--recursos)
2. [Arquitetura & Decisões Técnicas](#-arquitetura--decisões-técnicas)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Como Executar o Projeto](#-como-executar-o-projeto)
5. [Credenciais de Teste Pré-semeadas](#-credenciais-de-teste-pré-semeadas)
6. [Guia de Teste Ponta a Ponta](#-guia-de-teste-ponta-a-ponta)
7. [Testes Automatizados](#-testes-automatizados)
8. [Declaração sobre o Uso de IA](#-declaração-sobre-o-uso-de-ia)
9. [Deploy em Produção](#-deploy-em-produção)

---

## 🌟 Visão Geral & Recursos

O **Passfy** soluciona o ciclo de vida completo de eventos e ingressos através de três perfis integrados (**Organizador**, **Cliente** e **Portaria**):

* 🎪 **Painel do Organizador**:
  * Integração nativa com a API do **TMDb** para busca e importação com 1 clique de filmes em cartaz (título, sinopse, poster em alta resolução).
  * Criação de eventos com **grade interativa de assentos numerados** (ex: cinema/teatro com fileiras A–F) ou **pista por quantidade**.
  * Métricas em tempo real de ocupação, ingressos vendidos e receita.
* 👤 **Experiência do Cliente**:
  * Catálogo público com busca em tempo real e filtros de categoria.
  * **Mapa de Assentos Interativo** em tempo real com seleção de poltronas e prevenção instantânea de concorrência (*double booking*).
  * **Checkout Simulado Completo** (Pix ou Cartão) com alternador interativo para simular **Aprovação Imediata** ou **Recusa Proposital** (Saldo Insuficiente, Cartão Bloqueado, etc.).
  * Carteira de **Meus Ingressos Digitais** no estilo *Apple Wallet Pass*, com código de barras, QR Code em alta definição e botão de **compartilhamento público por link seguro**.
* 📷 **Portaria & Validação de Entrada**:
  * **Leitor de Câmera em Tempo Real** via navegador para leitura contínua de QR Codes.
  * **Digitação Manual de Código** como fallback imediato (ex: `PAS-DEMO1`).
  * Validação criptográfica com retorno visual e alertas sonoros instantâneos nos **4 estados obrigatórios**:
    * 🟢 **Válido**: Entrada liberada e marcação atômica de uso.
    * 🟡 **Já Utilizado**: Informa data/hora e quem realizou a validação anterior.
    * 🔵 **Evento Errado**: Ingresso autêntico, mas emitido para outra sessão.
    * 🔴 **Inválido / Forjado**: Assinatura criptográfica violada ou código inexistente.
* ⚡ **Barra de Demonstração (Role Switcher)**:
  * Permite ao avaliador alternar instantaneamente entre Organizador, Cliente 1, Cliente 2 e Portaria com **1 clique**, sem atrito de login/logout.

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
│   │           ├── catalog/          # Adapter Pattern para API do TMDb
│   │           ├── events/           # Gestão de eventos e geração de assentos
│   │           ├── bookings/         # Concorrência e Checkout Simulado
│   │           ├── tickets/          # Emissão de ingressos e link compartilhável
│   │           └── checkin/          # Validação da Portaria e Máquina de Estados
│   │
│   └── web/                          # Frontend React 18 + Vite + Tailwind CSS
│       └── src/
│           ├── components/           # SeatMap, TicketCard, RoleSwitcher, Modal, UI
│           ├── contexts/             # AuthContext e Sessão
│           ├── pages/                # Home, EventDetails, Organizer, MyTickets, Gatekeeper
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

### 3. Adapter Pattern para Catálogo Externo
* A interface `ICatalogProvider` define o contrato de busca e detalhes.
* A implementação `TmdbCatalogProvider` comunica-se com a API do TMDb e possui **fallback inteligente embutido**, garantindo que o sistema funcione com dados ricos mesmo se executado offline ou sem chave de API.

---

## 🛠️ Tecnologias Utilizadas

* **Backend**: Node.js 22, Express, TypeScript, Prisma ORM, PostgreSQL 16, Zod, JWT (`jsonwebtoken`), Bcryptjs, QRCode, Crypto nativo (HMAC-SHA256), Vitest.
* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Html5-QRCode, Axios.
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
| 🎪 **Organizador** | Carlos Organizador | `organizador@passfy.com` | `password123` | Criação de eventos com TMDb e Painel |
| 👤 **Cliente 1** | Ana Silva | `cliente1@passfy.com` | `password123` | Compra de ingressos e visualização |
| 👤 **Cliente 2** | Bruno Costa | `cliente2@passfy.com` | `password123` | Teste de concorrência e compra |
| 📷 **Portaria** | Lucas Portaria | `portaria@passfy.com` | `password123` | Leitor de câmera e validação de ingressos |

> 💡 **Dica de Avaliação**: Use a barra superior **Role Switcher** na interface para alternar entre qualquer um desses usuários com **1 único clique** sem precisar digitar e-mail e senha!

---

## 🧪 Guia de Teste Ponta a Ponta

Para validar o fluxo completo conforme solicitado no edital:

1. **Explorar Eventos**:
   * Acesse `http://localhost:5173` e veja os eventos já cadastrados (Sessão de Cinema e Show de Pista).
2. **Publicar Novo Evento com TMDb**:
   * Alterne para o perfil **Organizador** no topo.
   * Clique em **"Publicar Evento"** -> **"Importar do Catálogo TMDb"**.
   * Busque por um filme (ex: *Divertida Mente*, *Deadpool*, *Alien*), selecione e veja o formulário auto-preenchido com posters reais e mapa de assentos configurável. Clique em publicar.
3. **Reserva no Mapa de Assentos & Pagamento**:
   * Alterne para o perfil **Cliente 1**.
   * Abra a sessão de cinema, selecione duas poltronas no mapa (ex: `B-3` e `B-4`) e clique em **"Comprar"**.
   * No modal de pagamento, experimente testar **"Simular Recusa"** para ver a mensagem de erro do gateway e depois confirme com **"Forçar Aprovação"**.
4. **Ingressos Digitais & Compartilhamento**:
   * Acesse **"Meus Ingressos"** e veja o pass emitido com QR Code em alta definição.
   * Clique em **"Compartilhar Link"** e abra o link gerado em uma janela anônima para comprovar a visualização pública.
5. **Validação na Portaria**:
   * Alterne para o perfil **Portaria** e acesse a tela do scanner.
   * Valide com a câmera ou digite o código de teste semeado **`PAS-DEMO1`**:
     * 1ª leitura: 🟢 **Entrada Autorizada** (com bip sonoro agradável).
     * 2ª leitura do mesmo código: 🟡 **Ingresso Já Utilizado** (com aviso e horário da 1ª entrada).
     * Digitação de código inexistente ou forjado: 🔴 **Ingresso Inválido**.

---

## 🔬 Testes Automatizados

Para rodar a suíte de testes unitários e de concorrência:

```bash
npm run test --workspace=@passfy/api
```

### Cobertura de Testes Chave:
* `concurrency.spec.ts`: Simula requisições simultâneas disputando o mesmo assento e valida que apenas uma tem sucesso e a outra recebe `409 Conflict`.
* `checkin.spec.ts`: Valida os 4 estados da portaria (Válido, Já Usado, Evento Errado, Assinatura Forjada/Inválida).

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
   * Criação do componente **Role Switcher** na UI para eliminar o atrito do avaliador durante o percurso dos fluxos.
   * Modelagem intencional da interface com foco em paleta dark sóbria, micro-interações, tipografia moderna (*Plus Jakarta Sans*) e feedback auditivo via Web Audio API.

---

## 🌐 Deploy em Produção

* **Frontend (Vercel)**: `https://passfy.vercel.app` *(ou URL fornecida na entrega)*
* **Backend (Render / Railway)**: `https://passfy-api.onrender.com`
* **Banco de Dados (PostgreSQL)**: Neon Serverless Database

---

### Licença
Distribuído sob a licença MIT. Desenvolvido com dedicação por **Pierre Brito**.
