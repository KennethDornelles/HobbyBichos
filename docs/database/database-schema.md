## Esquema do Banco de Dados

O banco de dados do HobbyBichos é modelado e gerenciado com o Prisma ORM. Abaixo está a descrição de cada uma das tabelas e seus relacionamentos.

### Modelo `User`

Armazena as informações dos usuários da plataforma.

| Campo      | Tipo       | Descrição                               |
|------------|------------|-----------------------------------------|
| `id`       | `Int`      | Identificador único (PK)                |
| `email`    | `String`   | Email único do usuário.                 |
| `password` | `String`   | Senha hash do usuário.                  |
| `name`     | `String`   | Nome do usuário.                        |
| `phone`    | `String?`  | Telefone de contato (opcional).         |
| `cpf`      | `String?`  | CPF do usuário (único, opcional).       |
| `role`     | `Role`     | Papel do usuário (`ADMIN` ou `CUSTOMER`). |
| `isActive` | `Boolean`  | Indica se o usuário está ativo.         |

**Relacionamentos:**
- Um usuário pode ter vários `Address` (endereços).
- Um usuário pode ter vários `Order` (pedidos).
- Um usuário pode ter várias `Review` (avaliações).

### Modelo `Address`

Armazena os endereços de entrega dos usuários.

| Campo        | Tipo      | Descrição                               |
|--------------|-----------|-----------------------------------------|
| `id`         | `Int`     | Identificador único (PK)                |
| `street`     | `String`  | Nome da rua.                            |
| `number`     | `String`  | Número do endereço.                     |
| `complement` | `String?` | Complemento (opcional).                 |
| `neighborhood`| `String` | Bairro.                                 |
| `city`       | `String`  | Cidade.                                 |
| `state`      | `String`  | Estado.                                 |
| `zipCode`    | `String`  | CEP.                                    |
| `isDefault`  | `Boolean` | Indica se é o endereço padrão.          |
| `userId`     | `Int`     | Chave estrangeira para `User`.          |

**Relacionamentos:**
- Pertence a um `User`.
- Pode estar associado a vários `Order`.

### Modelo `Category`

Organiza os produtos em categorias.

| Campo       | Tipo      | Descrição                               |
|-------------|-----------|-----------------------------------------|
| `id`        | `Int`     | Identificador único (PK)                |
| `name`      | `String`  | Nome da categoria (único).              |
| `description`| `String?`| Descrição da categoria (opcional).      |
| `imageUrl`  | `String?` | URL da imagem da categoria (opcional).  |
| `isActive`  | `Boolean` | Indica se a categoria está ativa.       |

**Relacionamentos:**
- Uma categoria pode ter vários `Product`.

### Modelo `Product`

Armazena as informações dos produtos vendidos.

| Campo       | Tipo      | Descrição                               |
|-------------|-----------|-----------------------------------------|
| `id`        | `Int`     | Identificador único (PK)                |
| `name`      | `String`  | Nome do produto.                        |
| `description`| `String` | Descrição detalhada do produto.         |
| `price`     | `Decimal` | Preço original do produto.              |
| `salePrice` | `Decimal?`| Preço com desconto (opcional).          |
| `stock`     | `Int`     | Quantidade em estoque.                  |
| `sku`       | `String`  | Código de identificação do produto (único).|
| `categoryId`| `Int`     | Chave estrangeira para `Category`.      |

**Relacionamentos:**
- Pertence a uma `Category`.
- Pode ter várias `ProductImage`.
- Pode estar em vários `OrderItem`.
- Pode ter várias `Review`.

### Modelo `ProductImage`

Armazena as imagens associadas a um produto.

| Campo     | Tipo      | Descrição                               |
|-----------|-----------|-----------------------------------------|
| `id`      | `Int`     | Identificador único (PK)                |
| `url`     | `String`  | URL da imagem.                          |
| `alt`     | `String`  | Texto alternativo para a imagem.        |
| `isMain`  | `Boolean` | Indica se é a imagem principal do produto.|
| `productId`| `Int`    | Chave estrangeira para `Product`.       |

**Relacionamentos:**
- Pertence a um `Product`.

### Modelo `Order`

Armazena as informações dos pedidos feitos pelos usuários.

| Campo         | Tipo        | Descrição                               |
|---------------|-------------|-----------------------------------------|
| `id`          | `Int`       | Identificador único (PK)                |
| `orderNumber` | `String`    | Número de identificação do pedido (único).|
| `status`      | `OrderStatus`| Status atual do pedido.                 |
| `total`       | `Decimal`   | Valor total do pedido.                  |
| `userId`      | `Int`       | Chave estrangeira para `User`.          |
| `addressId`   | `Int`       | Chave estrangeira para `Address`.       |

**Relacionamentos:**
- Pertence a um `User`.
- Associado a um `Address` de entrega.
- Contém vários `OrderItem`.

### Modelo `OrderItem`

Representa um item dentro de um pedido.

| Campo     | Tipo      | Descrição                               |
|-----------|-----------|-----------------------------------------|
| `id`      | `Int`     | Identificador único (PK)                |
| `quantity`| `Int`     | Quantidade do produto no pedido.        |
| `price`   | `Decimal` | Preço unitário do produto no momento da compra.|
| `orderId` | `Int`     | Chave estrangeira para `Order`.         |
| `productId`| `Int`    | Chave estrangeira para `Product`.       |

**Relacionamentos:**
- Pertence a uma `Order`.
- Associado a um `Product`.

### Modelo `Review`

Armazena as avaliações dos produtos feitas pelos usuários.

| Campo     | Tipo      | Descrição                               |
|-----------|-----------|-----------------------------------------|
| `id`      | `Int`     | Identificador único (PK)                |
| `rating`  | `Int`     | Nota da avaliação (1 a 5).              |
| `comment` | `String?` | Comentário da avaliação (opcional).     |
| `userId`  | `Int`     | Chave estrangeira para `User`.          |
| `productId`| `Int`    | Chave estrangeira para `Product`.       |

**Relacionamentos:**
- Pertence a um `User`.
- Associada a um `Product`.

---

## Enums

### Enum `Role`

Define os papéis de usuário no sistema.

- `ADMIN`
- `CUSTOMER`

### Enum `OrderStatus`

Define os possíveis status de um pedido.

- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`
