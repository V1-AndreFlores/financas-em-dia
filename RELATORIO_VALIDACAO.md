# Relatório de Validação — Finanças em Dia 1.1.2

Data: 13/07/2026

## Escopo validado

- Recorrências com quantidade definida ou sem término.
- Geração inicial de 12 ocorrências para séries sem término.
- Extensão automática das séries ao navegar para ciclos futuros.
- Preservação da edição independente de cada ocorrência.
- Exclusão de contas com remoção em cascata dos lançamentos vinculados.
- Edição e exclusão de categorias.
- Realocação de lançamentos para a categoria Outros antes da exclusão da categoria original.
- Proteção da categoria de segurança Outros.
- Ajuste de teclado e rolagem para manter o campo focado visível.
- Migração do snapshot persistido para a versão 3.
- Preservação das funcionalidades da versão 1.1.1.

## Resultados

- TypeScript estrito: aprovado.
- Bundle Web: aprovado.
- Bundle Android: aprovado.
- Bundle iOS: aprovado.
- Configuração pública do Expo: aprovada.
- `package-lock.json` mantido sem referências ao registro interno.
- Nenhuma nova dependência nativa adicionada.

## Regras verificadas

### Recorrência sem término

- A série recebe `total: null` e `isOpenEnded: true`.
- Doze ocorrências são criadas inicialmente.
- O listener do Redux amplia a série quando o ciclo consultado ultrapassa a última ocorrência existente.
- Ocorrências futuras são criadas como pendentes.
- Exclusões individuais são registradas em `excludedOccurrences` para não serem recriadas.

### Exclusão de conta

- A confirmação apresenta a quantidade de lançamentos vinculados.
- `transactionsDeletedByAccountId` remove os lançamentos antes de `accountDeleted` remover a conta.
- A persistência e as notificações são recalculadas pelo listener existente.

### Exclusão de categoria

- A categoria `category-other` permanece ativa e com tipo `both`.
- Lançamentos vinculados são realocados por `transactionsCategoryReassigned`.
- A categoria é removida somente após a realocação.
- O tipo da categoria não pode ser alterado quando isso tornaria lançamentos existentes incompatíveis.

### Teclado

- Telas principais usam `KeyboardAvoidingView` e `KeyboardAwareScrollView`.
- Modais inferiores reduzem a área útil ao abrir o teclado.
- Campos de texto, moeda e data solicitam rolagem automática para a área visível.
- O espaço inferior do conteúdo é ampliado enquanto o teclado permanece aberto.

## Observações

- Como não foram adicionados plugins ou dependências nativas, não é obrigatório gerar novo APK apenas por esta alteração. Um novo build continua necessário para distribuir a versão 1.1.2.
- A exclusão de uma conta é destrutiva e não pode ser desfeita.
- A exclusão de categoria preserva os lançamentos financeiros ao movê-los para Outros.

## Verificações adicionais

- Testes de lógica da recorrência sem término: aprovados.
- Extensão da série em lotes e numeração das ocorrências: aprovadas.
- Registro de ocorrência excluída para impedir recriação: aprovado.
- Realocação de categoria pelo reducer: aprovada.
- Exclusão em cascata por conta pelo reducer: aprovada.
- Auditoria npm: nenhuma vulnerabilidade alta ou crítica; 10 alertas moderados transitivos no toolchain do Expo. A correção forçada não foi aplicada porque indicaria downgrade incompatível do Expo.
