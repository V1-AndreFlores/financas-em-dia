# Relatório de Validação — Finanças em Dia 1.0.2

Data: 13/07/2026

## Correção desta versão

- Normalização automática de snapshots persistidos incompletos ou incompatíveis.
- Proteção contra `state.categories.items` indefinido na tela de novo lançamento.
- Fallback defensivo para contas, categorias e lançamentos nas telas e na persistência.
- Persistência do snapshot corrigido após a hidratação.

## Validações concluídas

- `npm run typecheck`: aprovado com TypeScript estrito e `noUncheckedIndexedAccess`.
- Bundle Web: aprovado.
- Bundle Android: aprovado.
- Bundle iOS: aprovado.
- `package-lock.json`: sem referências a registros internos.
- Registro público `https://registry.npmjs.org/`: 544 referências.

## Auditoria npm

- Críticas: 0
- Altas: 0
- Moderadas: 10
- Baixas: 0

Os alertas moderados são transitivos do toolchain do Expo/CLI. O `npm audit fix --force` não foi aplicado porque pode introduzir versões incompatíveis.

## Persistência validada por bundle

- Web carrega somente o adaptador AsyncStorage.
- Android e iOS carregam o adaptador SQLite.
- A normalização é executada antes da hidratação do Redux em todas as plataformas.
