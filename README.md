# Finanças em Dia

Versão atual: **1.1.1**

Aplicativo mobile e web, offline-first, para controle financeiro pessoal. Construído com React Native, Expo e TypeScript.

## Tecnologias

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript 6
- Redux Toolkit e React Redux
- React Navigation
- AsyncStorage na Web
- SQLite no Android e iOS
- Expo Notifications para lembretes locais
- Expo Local Authentication para biometria
- Expo Secure Store e Expo Crypto para proteção do PIN

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

## Funcionalidades

- Resumo financeiro por ciclo configurável.
- Navegação compartilhada entre ciclos anteriores e futuros.
- Cadastro de receitas e despesas únicas.
- Lançamentos recorrentes com frequência semanal, quinzenal, mensal ou anual.
- Cada ocorrência recorrente é independente e pode ter valor, data, situação, categoria, conta e observação editados.
- Compras parceladas com geração automática das parcelas restantes.
- Possibilidade de iniciar um parcelamento em qualquer parcela, por exemplo, da parcela 3/10 até 10/10.
- Edição e exclusão individual de lançamentos.
- Filtros avançados por ciclo, período personalizado, tipo, situação, categoria, conta e faixa de valor.
- Cadastro e edição de contas com saldo inicial e data de referência.
- Saldo consolidado calculado até o final do ciclo selecionado.
- Lembretes locais para despesas pendentes.
- Bloqueio por biometria ou PIN.
- Tema claro como padrão e tema escuro persistente até nova alteração do usuário.
- Campos de data com máscara automática `dd/MM/aaaa` e validação de datas reais.
- Tela de splash com duração mínima de 3 segundos e três pontos animados.
- Modais próprios e consistentes com a identidade visual do aplicativo.

## Datas

Os campos de data aceitam somente números e inserem as barras automaticamente durante a digitação.

Exemplo:

```text
20072026 → 20/07/2026
```

A validação rejeita datas incompletas ou inexistentes, como `31/02/2026`. Internamente, as datas continuam persistidas no formato ISO `yyyy-MM-dd`.

## Aparência

O aplicativo possui somente as opções **Claro** e **Escuro**:

- Claro é o padrão para instalações novas.
- A escolha é persistida localmente.
- Dados antigos configurados como “Sistema” são migrados automaticamente para Claro.

## Recorrências

Ao criar um lançamento recorrente, o aplicativo gera de 2 a 60 ocorrências. A primeira usa a situação escolhida; as futuras são criadas como pendentes.

Isso permite cadastrar contas com valores variáveis, como energia elétrica: cada cobrança futura pode ser aberta na tela **Lançamentos** e editada separadamente quando o valor real for conhecido.

## Parcelamentos

O campo **Valor de cada parcela** representa o valor mensal. O usuário informa o total e a parcela em que deseja começar.

Exemplo:

```text
Total: 10 parcelas
Começar na parcela: 3
```

O aplicativo cria as parcelas 3/10, 4/10, ... até 10/10.

## Navegação entre ciclos

As telas **Início**, **Lançamentos** e **Relatórios** possuem um seletor de ciclo. As setas permitem consultar períodos anteriores ou futuros sem alterar o dia inicial configurado em Ajustes. Tocar no período retorna ao ciclo atual.

## Notificações

- Disponíveis no Android e iOS.
- Usam notificações locais, sem servidor ou conta de usuário.
- São programadas para despesas pendentes futuras.
- O usuário escolhe a antecedência e o horário.
- São mantidos até 64 lembretes futuros.
- Alterações nos lançamentos reprogramam os avisos automaticamente.

Após incluir ou alterar plugins nativos, gere um novo APK/AAB:

```bash
eas build -p android --profile preview
```

## Segurança

- Biometria usa o mecanismo nativo do Android/iOS.
- PIN possui de 4 a 6 números.
- No Android/iOS, o hash do PIN fica no Secure Store do sistema.
- Na Web, o PIN usa o armazenamento local do navegador e não oferece o mesmo nível de proteção nativa.
- O bloqueio protege a interface do aplicativo; o snapshot financeiro não é criptografado integralmente nesta versão.

## Persistência

A aplicação usa uma interface de repositório única:

- Web: `AsyncStorageAppDataRepository`
- Android/iOS: `SQLiteAppDataRepository`

O snapshot persistido usa a versão 2. Dados anteriores são normalizados durante a inicialização.
