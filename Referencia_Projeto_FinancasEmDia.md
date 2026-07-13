# Referência do Projeto — Finanças em Dia

Última atualização: 13/07/2026  
Versão da referência: 1.0.2

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

## 3. Decisões de arquitetura

A aplicação usa Clean Architecture adaptada ao mobile:

- `domain`: entidades e contratos independentes de framework.
- `infrastructure`: persistência, seeds e implementações técnicas.
- `features`: estados e regras de atualização por domínio.
- `presentation`: telas, componentes e tema.
- `application`: composição, navegação e store.
- `shared`: utilitários sem dependência de feature.

A persistência é feita por `IAppDataRepository`. O adaptador é escolhido por plataforma:

- Web: `AsyncStorageAppDataRepository`
- Android/iOS: `SQLiteAppDataRepository`

O snapshot persistido possui versão 1 e contém contas, categorias, lançamentos e ajustes.

## 4. Navegação

Abas inferiores:

1. Início
2. Lançamentos
3. Adicionar
4. Relatórios
5. Ajustes

## 5. Regras atuais

- Valores monetários são armazenados em centavos.
- Datas são persistidas em `yyyy-MM-dd` e exibidas em `dd/MM/yyyy`.
- Lançamentos podem ser receita ou despesa.
- Situações disponíveis: efetivado ou pendente.
- O resumo considera apenas lançamentos efetivados.
- O ciclo financeiro aceita início entre os dias 1 e 28.
- O dia 1 é o padrão e equivale ao mês-calendário.
- Contas e categorias personalizadas são arquivadas, não removidas fisicamente.
- Categorias e contas padrão não podem ser arquivadas pela interface atual.
- Dados ficam somente no dispositivo nesta versão.

## 6. Estrutura principal de arquivos

- `App.tsx`: bootstrap, hidratação e composição global.
- `src/application/navigation/AppNavigator.tsx`: abas inferiores.
- `src/application/store/index.ts`: Redux Store e persistência automática.
- `src/domain/entities/*`: entidades do domínio.
- `src/domain/repositories/IAppDataRepository.ts`: contrato de persistência.
- `src/infrastructure/persistence/*`: AsyncStorage e SQLite.
- `src/infrastructure/seed/createInitialSnapshot.ts`: dados iniciais.
- `src/infrastructure/seed/normalizeAppSnapshot.ts`: normalização e recuperação de snapshots persistidos incompletos.
- `src/features/*`: slices Redux.
- `src/presentation/components/*`: componentes reutilizáveis.
- `src/presentation/screens/*`: telas.
- `src/presentation/theme/*`: temas claro e escuro.
- `src/shared/utils/*`: moeda, datas, IDs e período financeiro.
- `MANIFESTO_PROJETO.json`: relação de arquivos e hashes SHA-256 da baseline.

## 7. Funcionalidades entregues

- Painel do ciclo financeiro.
- Saldo consolidado.
- Total de receitas, despesas e pendências.
- Cadastro de receitas e despesas.
- Histórico pesquisável.
- Alteração entre efetivado e pendente.
- Exclusão de lançamentos.
- Relatório de despesas por categoria.
- Cadastro e arquivamento de contas personalizadas.
- Cadastro e arquivamento de categorias personalizadas.
- Tema claro, escuro e do sistema.
- Configuração do dia inicial do ciclo.
- Redefinição dos dados locais.


## 8. Correções registradas

### Versão 1.0.2

- Corrigido erro em `AddTransactionScreen` ao acessar `state.categories.items` quando um snapshot persistido estava incompleto ou incompatível.
- A hidratação agora normaliza os dados carregados antes de enviá-los aos slices Redux.
- Arrays ausentes de contas, categorias ou lançamentos passam a receber valores seguros.
- Ajustes inválidos do ciclo financeiro e tema são substituídos pelos valores padrão.
- Seletores das telas receberam fallback defensivo para evitar falhas durante Fast Refresh ou estados incompletos em desenvolvimento.
- O snapshot normalizado é salvo novamente após a hidratação.

## 9. Itens planejados para versões posteriores

- Cartões de crédito.
- Compras parceladas.
- Despesas e receitas recorrentes.
- Orçamento por categoria.
- Metas financeiras.
- Exportação.
- Backup e restauração em nuvem.
- Biometria.
- Notificações.

## 10. Regra para próximas alterações

Antes de alterar um arquivo existente:

1. Trabalhar sempre sobre a versão mais recente do arquivo.
2. Preservar funcionalidades e decisões já registradas.
3. Atualizar este documento ao incluir, remover ou renomear arquivos.
4. Entregar arquivos completos, não apenas trechos.
5. Executar a validação TypeScript antes de gerar o pacote.
6. Atualizar `MANIFESTO_PROJETO.json` com `npm run manifest`.
