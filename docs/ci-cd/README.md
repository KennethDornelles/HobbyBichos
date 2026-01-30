# CI/CD - HobbyBichos

Pipeline de integração contínua via GitHub Actions.

## Workflow Principal

**Arquivo**: [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

## Triggers

| Evento | Branches |
|--------|----------|
| Push | `main`, `develop` |
| Pull Request | `main`, `develop` |

## Jobs

### 1. build-and-test (API)

Testa e valida o backend NestJS.

| Etapa | Descrição |
|-------|-----------|
| Postgres Service | Container PostgreSQL 15 para testes |
| Cache | node_modules cacheado por package-lock.json |
| Prisma Generate | Gera cliente Prisma |
| Migrate Deploy | Aplica migrations |
| Test Coverage | Roda `npm run test:cov` |
| Upload Artifact | Salva relatório de cobertura |

**Variáveis**:
```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/hobbybichos_test
```

### 2. build-and-test-mobile

Valida o app mobile Expo/React Native.

| Etapa | Descrição |
|-------|-----------|
| Cache | node_modules cacheado |
| Install | `npm ci` |
| Test | `npm test` |

## Artefatos

| Nome | Conteúdo |
|------|----------|
| `coverage-report` | Relatório de cobertura de testes da API |

## Cache

Ambos os jobs utilizam cache para acelerar builds:

```yaml
key: ${{ runner.os }}-build-cache-node-modules-${{ hashFiles('*/package-lock.json') }}
```

## Comandos Locais

Para rodar os mesmos testes localmente:

```bash
# API
cd api
npm ci
npx prisma generate
npx prisma migrate deploy
npm run test:cov

# Mobile
cd mobile
npm ci
npm test
```

## Status Badge

Adicione ao README do projeto:

```markdown
![CI](https://github.com/SEU_USUARIO/HobbyBichos/actions/workflows/ci.yml/badge.svg)
```
