# Autenticação e Autorização

O sistema de autenticação e autorização do HobbyBichos é baseado em **JSON Web Tokens (JWT)** e **Roles (Papéis)** para garantir que apenas usuários autenticados e com as permissões corretas possam acessar os recursos da API.

## Fluxo de Autenticação

1.  **Login:** O usuário envia suas credenciais (email e senha) para o endpoint `POST /auth/login`.
2.  **Validação:** O backend valida as credenciais.
3.  **Geração do Token:** Se as credenciais forem válidas, o backend gera um token JWT contendo informações do usuário (como ID e roles).
4.  **Retorno do Token:** O token é retornado ao cliente.

## Acessando Rotas Protegidas

Para acessar uma rota protegida, o cliente deve incluir o token JWT no cabeçalho `Authorization` de cada requisição, no formato `Bearer {token}`.

**Exemplo:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O `JwtAuthGuard` intercepta a requisição, valida o token e anexa o objeto do usuário à requisição, tornando-o disponível nos controllers.

## Controle de Acesso Baseado em Papéis (Roles)

Utilizamos um sistema de papéis para controlar o que cada tipo de usuário pode fazer.

- **`ADMIN`**: Acesso total ao sistema.
- **`CUSTOMER`**: Acesso a funcionalidades de cliente, como criar pedidos e fazer avaliações.

O decorator `@Roles()` é usado nos controllers para especificar quais papéis são necessários para acessar um determinado endpoint.

**Exemplo:**

```typescript
@Post()
@Roles('ADMIN')
create(@Body() createProductDto: CreateProductDto) {
  // Apenas usuários com o papel 'ADMIN' podem acessar este endpoint.
}
```