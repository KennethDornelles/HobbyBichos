# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Criar/Sobrescrever tsconfig.build.json para garantir que o build ignore 'test' e 'prisma'
# Isso força o TypeScript a manter a raiz em 'src', gerando 'dist/main.js' corretamente
RUN echo '{"extends": "./tsconfig.json", "compilerOptions": {"rootDir": "src"}, "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "prisma", "scripts"]}' > tsconfig.build.json

# Gerar o Prisma Client antes do build
RUN npx prisma generate

RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

# Instalar OpenSSL (necessário para o Prisma Client no Alpine)
RUN apk add --no-cache openssl

# Instalar todas as dependências (incluindo devDependencies)
# Isso garante que o binário do Prisma (versão 7+) e o ts-node estejam disponíveis
# para ler o prisma.config.ts e executar o seed.
RUN npm ci

# Instalar tipos do pg explicitamente para evitar erro TS7016 no seed
RUN npm install -D @types/pg

# Copiar arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]