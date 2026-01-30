# Docker - HobbyBichos

Configuração de containers para ambiente de desenvolvimento e produção.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| [Dockerfile](../../api/Dockerfile) | Build da API NestJS |
| [docker-compose.yml](../../api/docker-compose.yml) | Orquestração completa |

## Serviços

### API (NestJS)
- **Porta**: 3000
- **Base**: Node 20 Alpine
- **Build**: Multi-stage (builder + production)
- **Startup**: migrate → seed → start

### Banco de Dados (PostgreSQL + PostGIS)
- **Imagem**: `postgis/postgis:15-3.4-alpine`
- **Porta**: 5432
- **Volume**: `pgdata`
- **Healthcheck**: `pg_isready`

### Redis (Filas BullMQ)
- **Imagem**: `redis:7-alpine`
- **Porta**: 6379
- **Volume**: `redisdata`
- **Uso**: Filas de notificações

### Ngrok (Tunnel)
- **Imagem**: `ngrok/ngrok:latest`
- **Porta UI**: 4040
- **Uso**: Expor API publicamente para mobile

## Variáveis de Ambiente

Crie um arquivo `.env` na pasta `api/`:

```env
# Banco de dados
DB_HOST=db
DB_PORT=5432
DB_NAME=hobbybichos
DB_USER=postgres
DB_PASS=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d

# Email (Gmail)
GMAIL_USER=seu@email.com
GMAIL_PASS=app_password
GMAIL_FROM=HobbyBichos <noreply@hobbybichos.com>

# Redis
REDIS_PORT=6379
REDIS_PASSWORD=sua_senha_redis
REDIS_DB=0

# Ngrok (opcional)
NGROK_AUTHTOKEN=seu_token
NGROK_DOMAIN=seu-dominio.ngrok-free.app
```

## Comandos

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar tudo
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build api

# Rodar migrations manualmente
docker-compose exec api npx prisma migrate deploy

# Rodar seed manualmente
docker-compose exec api npx prisma db seed
```

## Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│   Ngrok     │────▶│    API      │
│    App      │     │  (tunnel)   │     │  (NestJS)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                         ▼                     ▼                     ▼
                  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
                  │  PostgreSQL │       │    Redis    │       │   BullMQ    │
                  │  + PostGIS  │       │   (cache)   │       │  (queues)   │
                  └─────────────┘       └─────────────┘       └─────────────┘
```
