# 🌐 GoStreams - Frontend

Interface web desenvolvida em **Next.js** (React & TypeScript) para gerenciamento de transmissões ao vivo, autenticação de usuários e aquisição de ingressos integrados a uma arquitetura de microsserviços.

---

## 🏗️ Arquitetura e Comunicação

O frontend foi projetado para **não se comunicar diretamente** com os microsserviços individuais. Todas as requisições de API (`/api/auth/*`, `/api/lives/*`, `/api/vendas/*`) são unificadas e roteadas automaticamente via `rewrites` para o **[API Gateway](https://github.com/CooingMTC/gateway.git)**, que opera como ponto único de entrada na porta **`8080`**.

### 🔗 Ecossistema de Repositórios

Para que todas as funcionalidades do frontend operem corretamente, os serviços do backend correspondentes devem estar disponíveis:

- 🚪 **API Gateway (Entrada Central - Porta 8080):** [github.com/CooingMTC/gateway](https://github.com/CooingMTC/gateway.git)
- 🔐 **Microsserviço de Login & Autenticação:** [github.com/CooingMTC/login](https://github.com/CooingMTC/login.git)
- 🎥 **Microsserviço de Produto (Lives):** [github.com/CooingMTC/produto](https://github.com/CooingMTC/produto.git)
- 🛒 **Microsserviço de Venda (Pedidos & Mensageria):** [github.com/CooingMTC/venda](https://github.com/CooingMTC/venda.git)

---

## ⚙️ Pré-requisitos

- **Node.js** (versão 18+ recomendada)
- Gerenciador de pacotes **npm**
- Todos os microsserviços e o **API Gateway** em execução localmente

---

## 🚀 Como Executar o Frontend

1. **Clone o repositório e acesse o diretório:**
   ```bash
   git clone <URL_DO_REPOSITORIO_FRONTEND>
   cd gotireams
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000) para interagir com a interface.

---

## 🔄 Fluxo de Funcionalidades no Frontend

1. **Autenticação:** Cadastro e login de usuários com emissão de token JWT e persistência via cookies seguros.
2. **Catálogo de Lives:** Criação e listagem de eventos ao vivo com vagas limitadas.
3. **Compra e Processamento Assíncrono:** Solicitação de ingressos com verificação de status do pedido em tempo real via protocolo UUID.
