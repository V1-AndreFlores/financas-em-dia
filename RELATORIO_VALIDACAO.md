# Relatório de Validação — Finanças em Dia 1.1.0

Data: 13/07/2026

## Escopo validado

- Edição de lançamentos.
- Navegação compartilhada entre ciclos.
- Filtros avançados.
- Cadastro e edição de saldo inicial por conta.
- Lançamentos recorrentes com ocorrências editáveis.
- Parcelamentos iniciados em qualquer parcela.
- Notificações locais.
- Bloqueio por biometria ou PIN.
- Migração do snapshot da versão 1 para a versão 2.

## Resultados

- TypeScript estrito: aprovado.
- Bundle Web: aprovado.
- Bundle Android: aprovado.
- Bundle iOS: aprovado.
- Resolução por plataforma dos serviços de notificação e segurança: aprovada nos bundles.
- Referências a registro npm interno no `package-lock.json`: zero.
- Dependências nativas compatíveis com Expo SDK 57: instaladas pelas versões recomendadas do SDK.

## Observações

- Biometria e notificações devem ser testadas em aparelho físico ou development/preview build.
- Face ID no iOS requer build próprio; não deve ser validado somente pelo Expo Go.
- A Web suporta PIN por armazenamento local, mas não biometria nesta versão.
- Notificações são locais e limitadas às 64 despesas pendentes futuras mais próximas.
- O bloqueio do aplicativo não representa criptografia integral do banco financeiro.

## Diagnóstico adicional

- `expo-doctor`: 18 de 20 verificações concluídas com sucesso.
- As duas verificações restantes não foram executadas porque o ambiente de validação não conseguiu acessar a API pública da Expo e o React Native Directory (`EAI_AGAIN exp.host`).
- Auditoria npm: 0 vulnerabilidades altas, 0 críticas e 10 moderadas transitivas do toolchain. Não foi aplicado `npm audit fix --force` para evitar alterações incompatíveis no SDK.
- Configuração pública do Expo (`expo config --type public`): processada com sucesso, incluindo plugins de notificações, biometria e armazenamento seguro.
