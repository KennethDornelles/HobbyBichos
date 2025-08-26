# Instalação

Este guia irá ajudá-lo a configurar o ambiente de desenvolvimento local para o projeto HobbyBichos.

## Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados:

- **[Node.js](https://nodejs.org/)**: Versão 18 ou superior.
- **[npm](https://www.npmjs.com/)**: Geralmente vem instalado com o Node.js.
- **[Angular CLI](https://angular.io/cli)**: `npm install -g @angular/cli`
- **[Docker](https://www.docker.com/products/docker-desktop)**: Para rodar o banco de dados PostgreSQL.

## Configuração do Backend

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie uma cópia do arquivo `.env.example` e renomeie para `.env`.
    - Preencha a variável `DATABASE_URL` com a URL de conexão do seu banco de dados PostgreSQL.

4.  **Inicie o banco de dados com Docker:**
    ```bash
    docker-compose up -d
    ```

5.  **Aplique as migrações do Prisma:**
    ```bash
    npx prisma migrate dev
    ```

## Configuração do Frontend

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

Após seguir estes passos, seu ambiente de desenvolvimento estará pronto. Consulte o guia de **[Desenvolvimento](./development.md)** para saber como executar a aplicação.