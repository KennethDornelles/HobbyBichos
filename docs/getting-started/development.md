# Desenvolvimento

Depois de ter o ambiente configurado e as dependências instaladas, você pode iniciar os servidores de desenvolvimento do backend e do frontend.

**Importante:** O backend e o frontend devem ser executados em terminais separados.

## Executando o Backend

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Inicie o servidor em modo de desenvolvimento:**
    ```bash
    npm run start:dev
    ```

O servidor do backend estará disponível em `http://localhost:3000` e será reiniciado automaticamente a cada alteração nos arquivos.

## Executando o Frontend

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```

2.  **Inicie o servidor de desenvolvimento do Angular:**
    ```bash
    ng serve
    ```

O servidor do frontend estará disponível em `http://localhost:4200` e a aplicação será recarregada automaticamente a cada alteração nos arquivos.

Com os dois servidores em execução, a aplicação HobbyBichos estará totalmente funcional em seu ambiente de desenvolvimento local.