# Introdução ao Frontend

O frontend do HobbyBichos é uma Single Page Application (SPA) desenvolvida com **Angular**. Ele é responsável por toda a interface com o usuário, oferecendo uma experiência rica, interativa e responsiva.

## Arquitetura e Estrutura de Pastas

A estrutura do projeto segue as convenções do Angular CLI, com duas pastas principais dentro de `src/`:

- **`app/`**: Contém todos os módulos, componentes, serviços e rotas da aplicação.
- **`styles/`**: Onde reside todo o nosso sistema de design. Contém os arquivos SCSS com variáveis, mixins e estilos de componentes globais.

## Tecnologias e Bibliotecas

- **Framework:** [Angular](https://angular.io/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [SCSS](https://sass-lang.com/)
- **Design System:** Sistema de design próprio, documentado na seção [Design System](./../design-system/introduction.md).

## Principais Funcionalidades

- **Componentização:** A interface é construída com base em componentes reutilizáveis.
- **Roteamento:** O Angular Router é usado para gerenciar a navegação entre as diferentes seções da aplicação.
- **Comunicação com a API:** O `HttpClient` do Angular é utilizado para fazer requisições à API do backend, buscando e enviando dados.
- **Reatividade:** Utilizamos conceitos de programação reativa com RxJS para lidar com eventos e dados assíncronos.