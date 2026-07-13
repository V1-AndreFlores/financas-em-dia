# Finanças em Dia

Versão atual: **1.0.4**

Aplicativo mobile e web para controle financeiro pessoal, construído com React Native, Expo e TypeScript.

## Tecnologias

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Redux Toolkit
- React Redux
- React Navigation
- AsyncStorage na Web
- SQLite no Android e iOS
- Arquitetura offline-first

## Executar o projeto

```bash
npm install
npx expo start -c
```

Atalhos:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
```

## Persistência

A aplicação usa uma interface de repositório única:

- Web: `AsyncStorageAppDataRepository`
- Android/iOS: `SQLiteAppDataRepository`

Os dados são persistidos automaticamente após alterações no Redux.

## Inicialização e splash

- A tela `AppSplashScreen` é exibida antes da navegação principal.
- A duração mínima da splash é de 3 segundos.
- A hidratação dos dados locais ocorre em paralelo com a splash.
- Caso a hidratação demore mais de 3 segundos, a splash permanece visível até a inicialização terminar.
- A imagem utilizada fica em `assets/images/splash.png`.
- A configuração nativa inicial está registrada no `app.json` para evitar uma transição visual brusca.
- Três pontos animados são exibidos abaixo do texto “Controle financeiro pessoal” durante o carregamento.

## Funcionalidades desta entrega

- Resumo financeiro por ciclo
- Receitas e despesas
- Situação efetivada ou pendente
- Contas e carteiras
- Categorias padrão e personalizadas
- Pesquisa e filtros de lançamentos
- Relatório de despesas por categoria
- Tema claro, escuro ou do sistema
- Configuração do início do ciclo entre os dias 1 e 28
- Exclusão e redefinição dos dados locais
- Tela de splash com duração mínima de 3 segundos e indicador animado de três pontos

## Escopo posterior

- Cartões de crédito
- Parcelamentos
- Metas financeiras
- Orçamento por categoria
- Backup em nuvem
- Notificações

## Recuperação de dados locais

Na inicialização, o aplicativo normaliza snapshots persistidos de versões anteriores. Caso contas, categorias, lançamentos ou ajustes estejam ausentes, a aplicação utiliza valores seguros sem interromper a execução.
