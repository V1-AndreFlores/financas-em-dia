# Relatório de Validação — Finanças em Dia 1.1.4

Data: 14/07/2026

## Escopo validado

- Ajuste da visão financeira da tela Início.
- Inclusão de lançamentos efetivados e pendentes nos totais de receitas e despesas do ciclo.
- Cálculo do resultado projetado com todos os lançamentos do período.
- Separação das pendências em **A receber** e **A pagar**.
- Remoção do total único e ambíguo de pendências.
- Preservação do saldo consolidado com somente movimentações efetivadas.
- Preservação das funcionalidades da versão 1.1.3.

## Regras aplicadas

### Receitas

Soma todas as receitas do ciclo selecionado, independentemente de estarem efetivadas ou pendentes.

### Despesas

Soma todas as despesas do ciclo selecionado, independentemente de estarem efetivadas ou pendentes.

### Resultado do ciclo

Calculado por:

```text
Receitas previstas - Despesas previstas
```

### A receber

Soma exclusivamente receitas pendentes do ciclo.

### A pagar

Soma exclusivamente despesas pendentes do ciclo.

### Saldo consolidado

Permanece calculado com saldos iniciais e lançamentos efetivados até o final do ciclo. Dessa forma, representa o dinheiro efetivamente disponível, enquanto os cards do ciclo representam a projeção financeira.

## Ajuste visual

- Foi incluída uma descrição objetiva acima dos cards explicando as regras.
- O card **Resultado do ciclo** ocupa a largura total.
- **A receber** usa a identidade visual de receita.
- **A pagar** usa a identidade visual de despesa.

## Resultados

- TypeScript estrito: aprovado.
- Bundle Web: aprovado.
- Bundle Android: aprovado.
- Bundle iOS: aprovado.
- Nenhuma dependência adicionada.
- Nenhuma migração de persistência necessária.

## Auditoria de dependências

- Nenhuma vulnerabilidade alta ou crítica.
- Permanecem 10 alertas moderados transitivos do toolchain do Expo.
- A correção automática com `npm audit fix --force` não foi aplicada porque propõe downgrade incompatível do Expo.

## Observações

- Não foram adicionados plugins nem dependências.
- Não é necessário executar `npm ci` para aplicar o pacote incremental.
- Não houve alteração no formato do snapshot persistido.
- Um novo APK/AAB é necessário somente para distribuir a versão 1.1.4 instalada.
