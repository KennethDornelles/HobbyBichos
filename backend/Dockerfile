# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copia os arquivos de pacote e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código-fonte da aplicação
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Compila a aplicação
RUN npm run build

# Estágio 2: Criação da imagem de produção
FROM node:20-alpine

WORKDIR /usr/src/app

# Copia os arquivos de pacote e instala apenas as dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia a aplicação compilada do estágio de build
COPY --from=builder /usr/src/app/dist ./dist

# Copia o schema e as migrations do Prisma
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

# Comando para executar as migrations e iniciar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]