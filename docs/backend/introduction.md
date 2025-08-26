# Introdução ao Backend

O backend do HobbyBichos é o coração da plataforma, responsável por toda a lógica de negócio, segurança e persistência de dados. Ele é construído com **NestJS**, um framework Node.js progressivo que nos permite criar aplicações eficientes, escaláveis e bem organizadas.

## Arquitetura

A arquitetura é baseada em módulos, onde cada funcionalidade principal da aplicação é encapsulada em seu próprio diretório. Isso promove a separação de responsabilidades e facilita a manutenção e o desenvolvimento de novas features.

Os principais módulos são:

- **Auth:** Autenticação e autorização de usuários.
- **Users:** Gerenciamento de perfis de usuários.
- **Address:** Gerenciamento de endereços dos usuários.
- **Category:** Organização dos produtos em categorias.
- **Product:** Gerenciamento do catálogo de produtos.
- **Product Image:** Upload e gerenciamento de imagens de produtos.
- **Order:** Lógica de criação e gerenciamento de pedidos.
- **Order Item:** Itens individuais de um pedido.
- **Review:** Avaliações de produtos feitas pelos usuários.

## Tecnologias

- **Framework:** [NestJS](https://nestjs.com/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Autenticação:** [Passport.js](https://www.passportjs.org/) com estratégia JWT.