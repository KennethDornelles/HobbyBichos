## Endpoints da API

Esta seção documenta todos os endpoints da API disponíveis no backend. A maioria das rotas requer autenticação JWT.

### Auth (`/auth`)

| Método | Rota        | Descrição                  |
|--------|-------------|----------------------------|
| `POST` | `/login`    | Autentica um usuário e retorna um token JWT. |

### Users (`/users`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `GET`  | `/`         | Retorna todos os usuários. | ADMIN       |
| `GET`  | `/:id`      | Retorna um usuário por ID. | ALL         |
| `POST` | `/`         | Cria um novo usuário.      | ALL         |
| `PATCH`| `/:id`      | Atualiza um usuário.       | OWNER, ADMIN|
| `DELETE`| `/:id`     | Deleta um usuário.         | OWNER, ADMIN|

### Address (`/address`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Cria um novo endereço.     | OWNER, ADMIN|
| `GET`  | `/`         | Retorna todos os endereços.| ADMIN       |
| `GET`  | `/:id`      | Retorna um endereço por ID.| OWNER, ADMIN|
| `PATCH`| `/:id`      | Atualiza um endereço.      | OWNER, ADMIN|
| `DELETE`| `/:id`     | Deleta um endereço.        | OWNER, ADMIN|

### Categories (`/categories`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Cria uma nova categoria.   | ADMIN       |
| `GET`  | `/`         | Retorna todas as categorias.| ALL         |
| `GET`  | `/:id`      | Retorna uma categoria por ID.| ALL         |
| `PUT`  | `/:id`      | Atualiza uma categoria.    | ADMIN       |
| `DELETE`| `/:id`     | Deleta uma categoria.      | ADMIN       |

### Products (`/products`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Cria um novo produto.      | ADMIN       |
| `GET`  | `/`         | Retorna todos os produtos. | ALL         |
| `GET`  | `/:id`      | Retorna um produto por ID. | ALL         |
| `PUT`  | `/:id`      | Atualiza um produto.       | ADMIN       |
| `DELETE`| `/:id`     | Deleta um produto.         | ADMIN       |

### Product Images (`/product-images`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Adiciona uma imagem a um produto.| ADMIN    |
| `GET`  | `/`         | Retorna todas as imagens.  | ALL         |
| `GET`  | `/:id`      | Retorna uma imagem por ID. | ALL         |
| `PUT`  | `/:id`      | Atualiza uma imagem.       | ADMIN       |
| `DELETE`| `/:id`     | Deleta uma imagem.         | ADMIN       |

### Orders (`/orders`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Cria um novo pedido.       | CUSTOMER    |
| `GET`  | `/`         | Retorna todos os pedidos.  | ADMIN       |
| `GET`  | `/:id`      | Retorna um pedido por ID.  | OWNER, ADMIN|
| `PUT`  | `/:id`      | Atualiza um pedido.        | ADMIN       |
| `DELETE`| `/:id`     | Deleta um pedido.          | ADMIN       |

### Order Items (`/order-items`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Cria um novo item de pedido.| ADMIN       |
| `GET`  | `/`         | Retorna todos os itens.    | ADMIN       |
| `GET`  | `/:id`      | Retorna um item por ID.    | ADMIN       |
| `PUT`  | `/:id`      | Atualiza um item.          | ADMIN       |
| `DELETE`| `/:id`     | Deleta um item.            | ADMIN       |

### Reviews (`/reviews`)

| Método | Rota        | Descrição                  | Permissão   |
|--------|-------------|----------------------------|-------------|
| `POST` | `/`         | Cria uma nova avaliação.   | CUSTOMER    |
| `GET`  | `/`         | Retorna todas as avaliações.| ALL         |
| `GET`  | `/:id`      | Retorna uma avaliação por ID.| ALL         |
| `PUT`  | `/:id`      | Atualiza uma avaliação.    | OWNER, ADMIN|
| `DELETE`| `/:id`     | Deleta uma avaliação.      | OWNER, ADMIN|
