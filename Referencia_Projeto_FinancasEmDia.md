# Referência do Projeto — Finanças em Dia

Última atualização: 13/07/2026  
Versão da referência: 1.1.3

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

O snapshot atual possui `version: 3` e contém contas, categorias, lançamentos e ajustes.

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
- Datas são persistidas em `yyyy-MM-dd` e exibidas/digitadas em `dd/MM/aaaa`.
- Todos os campos de data usam máscara automática e validação de data real.
- Tipos: receita ou despesa.
- Situações: efetivado ou pendente.
- O resultado do ciclo considera somente lançamentos efetivados dentro do período.
- O saldo consolidado considera saldos iniciais válidos e lançamentos efetivados até o final do ciclo selecionado.
- O início do ciclo aceita dias de 1 a 28.
- A navegação aceita até 120 ciclos anteriores ou futuros.
- Contas podem ser excluídas fisicamente; a exclusão remove todos os lançamentos vinculados após confirmação.
- Categorias podem ser editadas e excluídas; lançamentos vinculados são realocados para `category-other`.
- `category-other` é a categoria de segurança, permanece ativa, aceita receita e despesa e não pode ser excluída.

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

O usuário pode selecionar uma quantidade definida, entre 2 e 60, ou uma recorrência sem término. Séries sem término criam 12 ocorrências iniciais e são ampliadas em lotes ao consultar ciclos além do horizonte já gerado.

A primeira ocorrência respeita a situação escolhida; as demais começam pendentes. Cada ocorrência é uma entidade `FinancialTransaction` própria. Portanto, contas variáveis como luz, água ou condomínio podem ter o valor de cada mês editado separadamente sem alterar as outras ocorrências.

Metadados:

- `entryMode: recurring`
- `recurring.groupId`
- `recurring.current`
- `recurring.total` (`null` para série sem término)
- `recurring.frequency`
- `recurring.isOpenEnded`
- `recurring.seriesStartDate`
- `recurring.excludedOccurrences` para impedir que ocorrências excluídas sejam recriadas

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

## 14. Datas e máscara de entrada

Componente reutilizável:

- `src/presentation/components/DateInput.tsx`

Regras:

- aceita somente os oito dígitos de dia, mês e ano;
- insere `/` automaticamente após dia e mês;
- valida preenchimento completo;
- rejeita datas inexistentes pelo calendário;
- exibe erro inline após perda de foco;
- executa nova validação obrigatória antes de salvar ou aplicar filtros.

Aplicado em:

- novo lançamento;
- edição de lançamento;
- saldo inicial de conta;
- período personalizado dos filtros avançados.

## 15. Aparência

Preferências válidas:

- `light`
- `dark`

O tema claro é o padrão. A escolha do usuário é persistida no snapshot. Valores antigos `system` são convertidos para `light` durante a normalização.


## 16. Exclusão de contas e categorias

### Contas

- Todas as contas ativas podem ser excluídas, inclusive as cadastradas inicialmente.
- A confirmação informa quantos lançamentos estão vinculados.
- A exclusão remove a conta e todos os lançamentos associados, incluindo parcelas e ocorrências recorrentes já geradas.
- A remoção dos lançamentos força a ressincronização das notificações locais.

### Categorias

- Todas as categorias ativas podem ser editadas.
- A categoria `category-other` não pode ser excluída e mantém o tipo `both`.
- Ao excluir outra categoria, todos os lançamentos vinculados são realocados para `category-other` antes da remoção.
- A alteração do tipo é bloqueada quando existem lançamentos vinculados de tipo incompatível.

## 17. Teclado e visibilidade dos campos

- `KeyboardAwareScrollView.tsx` centraliza a rolagem para o campo em foco.
- `FormTextInput` e `MoneyInput` solicitam a exibição do campo acima do teclado.
- `AppScreen` e `AppModal` usam `KeyboardAvoidingView` com comportamento específico por plataforma.
- Formulários de conta, categoria, lançamento, filtros e PIN usam rolagem consciente do teclado.


## 18. Correção de seleção de categoria — versão 1.1.3

- O cadastro de lançamento passa a selecionar automaticamente a primeira categoria compatível quando não houver uma seleção válida.
- A categoria escolhida é preservada após salvar um lançamento, permitindo cadastros consecutivos sem perda de contexto.
- As listas de contas e categorias agora são derivadas de seletores estáveis do Redux, evitando recriações desnecessárias e efeitos que poderiam limpar a seleção.
- Ao trocar entre despesa e receita, a seleção é revalidada e substituída pela primeira categoria compatível.

## 19. Arquivos adicionados na versão 1.1.2

- `src/presentation/components/CategoryFormModal.tsx`
- `src/presentation/components/KeyboardAwareScrollView.tsx`

## 20. Arquivos adicionados na versão 1.1.0

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

## 21. Dependências nativas adicionadas

- `expo-notifications ~57.0.3`
- `expo-local-authentication ~57.0.0`
- `expo-secure-store ~57.0.0`
- `expo-crypto ~57.0.0`

Os plugins correspondentes estão configurados em `app.json`. Mudanças nativas exigem novo build EAS.

## 22. Próximos itens planejados

- Cartões de crédito e faturas.
- Transferências entre contas.
- Orçamento por categoria.
- Metas financeiras.
- Exportação, backup e restauração.
- Testes automatizados das regras financeiras.

## 23. Regra permanente de entrega

1. Trabalhar sobre a versão mais recente.
2. Preservar funcionalidades existentes.
3. Atualizar esta referência e o manifesto.
4. Entregar arquivos completos.
5. Gerar um único ZIP contendo somente arquivos modificados, preservando `financas-em-dia/...`.
6. Informar a linha do Expo e a linha do GitHub.
7. Validar TypeScript e bundles antes do pacote.
