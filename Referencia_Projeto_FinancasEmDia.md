# Referência do Projeto — Finanças em Dia

Última atualização: 13/07/2026  
Versão da referência: 1.1.0

## 1. Identidade

- Nome: Finanças em Dia
- Pasta: `financas-em-dia`
- Slug Expo: `financas-em-dia`
- Android package: `com.andreflores.financasemdia`
- iOS bundle identifier: `com.andreflores.financasemdia`
- Idioma: Português do Brasil
- Moeda: Real brasileiro
- Funcionamento: gratuito, sem anúncios, sem login e offline-first

## 2. Stack

- Expo SDK 57
- React Native 0.86
- React 19.2
- TypeScript 6
- Redux Toolkit
- React Redux
- React Navigation
- AsyncStorage para Web
- SQLite para Android/iOS
- Expo Notifications
- Expo Local Authentication
- Expo Secure Store
- Expo Crypto

## 3. Arquitetura

Clean Architecture adaptada ao mobile:

- `domain`: entidades e contratos.
- `infrastructure`: persistência, normalização, notificações e segurança.
- `features`: slices Redux e regras de alteração de estado.
- `presentation`: telas, modais, formulários e tema.
- `application`: navegação, composição e store.
- `shared`: utilitários de moeda, datas, períodos, IDs e séries financeiras.

Persistência por plataforma:

- Web: `AsyncStorageAppDataRepository`
- Android/iOS: `SQLiteAppDataRepository`

O snapshot atual possui `version: 2` e contém contas, categorias, lançamentos e ajustes.

## 4. Navegação

Abas inferiores:

1. Início
2. Lançamentos
3. Adicionar
4. Relatórios
5. Ajustes

As telas Início, Lançamentos e Relatórios compartilham o mesmo deslocamento de ciclo pelo slice `financialPeriod`.

## 5. Regras financeiras

- Valores são persistidos em centavos.
- Datas são persistidas em `yyyy-MM-dd` e exibidas em `dd/MM/yyyy`.
- Tipos: receita ou despesa.
- Situações: efetivado ou pendente.
- O resultado do ciclo considera somente lançamentos efetivados dentro do período.
- O saldo consolidado considera saldos iniciais válidos e lançamentos efetivados até o final do ciclo selecionado.
- O início do ciclo aceita dias de 1 a 28.
- A navegação aceita até 120 ciclos anteriores ou futuros.
- Contas e categorias personalizadas são arquivadas, sem exclusão física pela interface.

## 6. Saldo inicial

Cada conta possui:

- `initialBalanceInCents`
- `initialBalanceDate`
- `updatedAt`

O saldo inicial só participa do consolidado quando sua data é anterior ou igual ao final do ciclo consultado.

Contas padrão e personalizadas podem ter nome, tipo, saldo inicial e data editados.

## 7. Lançamentos únicos, recorrentes e parcelados

### Único

Cria uma movimentação independente.

### Recorrente

Frequências disponíveis:

- semanal;
- quinzenal;
- mensal;
- anual.

São geradas de 2 a 60 ocorrências. A primeira respeita a situação escolhida; as demais começam pendentes.

Cada ocorrência é uma entidade `FinancialTransaction` própria. Portanto, contas variáveis como luz, água ou condomínio podem ter o valor de cada mês editado separadamente sem alterar as outras ocorrências.

Metadados:

- `entryMode: recurring`
- `recurring.groupId`
- `recurring.current`
- `recurring.total`
- `recurring.frequency`

### Parcelado

- Total permitido: 2 a 120 parcelas.
- O usuário informa o número da parcela inicial.
- A data informada corresponde à parcela inicial.
- As parcelas seguintes são geradas mensalmente.
- O valor informado é o valor de cada parcela.
- A primeira parcela criada respeita a situação escolhida; as futuras começam pendentes.

Metadados:

- `entryMode: installment`
- `installment.groupId`
- `installment.current`
- `installment.total`

Exemplo: total 10 e início 3 gera 3/10 até 10/10.

## 8. Edição de lançamentos

A tela Lançamentos abre um painel inferior com:

- Editar lançamento;
- Marcar como pendente/efetivado;
- Excluir lançamento.

A edição permite alterar:

- tipo;
- descrição;
- valor;
- data;
- categoria;
- conta;
- situação;
- observação.

Em recorrências e parcelamentos, a edição afeta somente a ocorrência selecionada.

## 9. Filtros avançados

Filtros combináveis:

- ciclo selecionado;
- todos os períodos;
- período personalizado;
- tipo;
- situação;
- categoria;
- conta;
- valor mínimo;
- valor máximo;
- pesquisa textual por descrição, observação, categoria ou conta.

## 10. Notificações

Implementação:

- `notificationService.native.ts`: Expo Notifications no Android/iOS.
- `notificationService.web.ts`: implementação sem efeito para manter compatibilidade Web.

Regras:

- somente despesas pendentes;
- somente datas futuras;
- antecedência de 0 a 7 dias;
- horários pré-definidos na interface;
- máximo de 64 notificações futuras;
- todas as notificações são canceladas e recalculadas após alterações persistidas;
- canal Android: `financial-reminders`.

## 11. Biometria e PIN

Modos:

- `none`
- `biometric`
- `pin`

A biometria exige hardware e credencial cadastrada no aparelho. O PIN aceita de 4 a 6 números e é salvo como hash SHA-256 com salt aleatório.

Armazenamento:

- Android/iOS: Expo Secure Store.
- Web: AsyncStorage, com nível de proteção inferior ao armazenamento nativo.

O aplicativo bloqueia ao iniciar e quando sai do estado ativo. O bloqueio protege a interface, não criptografa integralmente o snapshot financeiro.

## 12. Inicialização e splash

- Splash visual mínima de 3 segundos.
- Hidratação executada em paralelo.
- Três pontos animados abaixo de “Controle financeiro pessoal”.
- Após hidratação, a segurança é validada antes de liberar a navegação.

## 13. Modais

- Não usar `Alert.alert` para fluxos do usuário.
- Ações usam `AppActionSheet`.
- Confirmações destrutivas usam `AppDialog`.
- Formulários extensos usam `AppModal` em painel inferior.
- Ações destrutivas são vermelhas.
- Cancelar é secundário.
- Não usar ícones nos botões dos modais.

## 14. Arquivos adicionados na versão 1.1.0

- `src/features/financialPeriod/financialPeriodSlice.ts`
- `src/infrastructure/notifications/notificationService.native.ts`
- `src/infrastructure/notifications/notificationService.web.ts`
- `src/infrastructure/security/securityService.native.ts`
- `src/infrastructure/security/securityService.web.ts`
- `src/presentation/components/AccountFormModal.tsx`
- `src/presentation/components/FinancialPeriodNavigator.tsx`
- `src/presentation/components/PinSetupModal.tsx`
- `src/presentation/components/TransactionFiltersModal.tsx`
- `src/presentation/components/TransactionFormModal.tsx`
- `src/presentation/screens/AppLockScreen.tsx`
- `src/shared/utils/transactionSeries.ts`

## 15. Dependências nativas adicionadas

- `expo-notifications ~57.0.3`
- `expo-local-authentication ~57.0.0`
- `expo-secure-store ~57.0.0`
- `expo-crypto ~57.0.0`

Os plugins correspondentes estão configurados em `app.json`. Mudanças nativas exigem novo build EAS.

## 16. Próximos itens planejados

- Cartões de crédito e faturas.
- Transferências entre contas.
- Orçamento por categoria.
- Metas financeiras.
- Exportação, backup e restauração.
- Testes automatizados das regras financeiras.

## 17. Regra permanente de entrega

1. Trabalhar sobre a versão mais recente.
2. Preservar funcionalidades existentes.
3. Atualizar esta referência e o manifesto.
4. Entregar arquivos completos.
5. Gerar um único ZIP contendo somente arquivos modificados, preservando `financas-em-dia/...`.
6. Informar a linha do Expo e a linha do GitHub.
7. Validar TypeScript e bundles antes do pacote.
