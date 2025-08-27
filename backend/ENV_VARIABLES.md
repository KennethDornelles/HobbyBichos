# Variáveis de Ambiente - HobbyBichos Backend

## Configurações de Banco de Dados

### Variáveis Básicas
- `DATABASE_HOST`: Endereço do servidor de banco de dados (padrão: localhost)
- `DATABASE_PORT`: Porta do PostgreSQL (padrão: 5432)
- `DATABASE_USER`: Nome de usuário do banco de dados
- `DATABASE_PASSWORD`: Senha do banco de dados
- `DATABASE_NAME`: Nome do banco de dados
- `DATABASE_SCHEMA`: Schema do banco (padrão: public)
- `DATABASE_URL`: URL completa de conexão (usado pelo Prisma)

### Configurações Avançadas de Conexão
- `DB_CONNECTION_TIMEOUT`: Timeout de conexão em ms (padrão: 60000)
- `DB_CONNECTION_POOL_MIN`: Mínimo de conexões no pool (padrão: 2)
- `DB_CONNECTION_POOL_MAX`: Máximo de conexões no pool (padrão: 10)
- `DB_QUERY_TIMEOUT`: Timeout de query em ms (padrão: 30000)

### SSL (Produção)
- `DB_SSL_ENABLED`: Habilitar SSL (padrão: false)
- `DB_SSL_REJECT_UNAUTHORIZED`: Rejeitar certificados não autorizados (padrão: false)

## Configurações do Servidor

- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (development, production)
- `CORS_ORIGIN`: Origem permitida para CORS (padrão: http://localhost:4200)

## Autenticação JWT

- `JWT_SECRET`: Chave secreta para assinatura dos tokens JWT
- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: 1d)

## Configurações de Logging

- `LOG_LEVEL`: Nível de log (error, warn, info, debug)
- `LOG_DATABASE_QUERIES`: Log de queries SQL (true/false)

## Rate Limiting

- `RATE_LIMIT_WINDOW_MS`: Janela de tempo para rate limiting em ms
- `RATE_LIMIT_MAX_REQUESTS`: Máximo de requisições por janela

## Upload de Arquivos

- `MAX_FILE_SIZE`: Tamanho máximo de arquivo em bytes (padrão: 10MB)
- `UPLOAD_PATH`: Caminho para salvar uploads (padrão: ./uploads)

## Exemplo de Configuração para Desenvolvimento

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=hobbybichos_user
DATABASE_PASSWORD=hobbybichos_password
DATABASE_NAME=hobbybichos_db
DATABASE_SCHEMA=public
DATABASE_URL=postgresql://hobbybichos_user:hobbybichos_password@localhost:5432/hobbybichos_db?schema=public

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui_2024
JWT_EXPIRES_IN=1d
```

## Exemplo de Configuração para Produção

```env
# Database (usando variáveis do provedor de cloud)
DATABASE_HOST=${DB_HOST}
DATABASE_PORT=${DB_PORT}
DATABASE_USER=${DB_USER}
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_NAME=${DB_NAME}
DATABASE_SCHEMA=public
DATABASE_URL=${DATABASE_URL}

# Server
PORT=${PORT}
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h

# SSL
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true

# Logging
LOG_LEVEL=error
LOG_DATABASE_QUERIES=false
```
