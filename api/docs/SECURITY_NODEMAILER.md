# Vulnerabilidades Nodemailer - Decisão de Aceitação de Risco

## Data: 05/01/2026

## Vulnerabilidades Aceitas

- nodemailer 6.9.16 (<=7.0.10)
- 3 vulnerabilidades baixas + 1 moderada

## Justificativa

1. **Controles Implementados:**
   - Validação estrita de emails com regex
   - Sanitização de todos os endereços
   - Bloqueio de caracteres especiais perigosos
   - Validação opcional de domínios permitidos

2. **Contexto de Uso:**
   - Emails processados apenas de fontes confiáveis
   - Todos os inputs validados no backend
   - Sem processamento de emails de APIs externas

3. **Risco Calculado:** BAIXO

## Mitigação

- Validador customizado implementado
- Sanitização em todas as operações
- Logs de tentativas suspeitas
- Monitoramento ativo

## Plano de Migração (Quando Disponível)

Migrar para nodemailer 7.x quando @nestjs-modules/mailer suportar oficialmente.

## Próxima Revisão: 01/04/2026
