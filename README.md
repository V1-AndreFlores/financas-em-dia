# Finanças em Dia

Versão atual: **1.1.4**

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
- Receitas, despesas e resultado do ciclo consideram lançamentos efetivados e pendentes, oferecendo uma visão financeira projetada.
- Valores pendentes são separados em **A receber** e **A pagar**, evitando a soma ambígua de créditos e débitos.
- O saldo consolidado continua representando somente saldos iniciais e movimentações efetivadas.
- Navegação compartilhada entre ciclos anteriores e futuros.
- Cadastro de receitas e despesas únicas.
- Lançamentos recorrentes com frequência semanal, quinzenal, mensal ou anual.
- Recorrências com quantidade definida ou sem término, com geração progressiva ao consultar ciclos futuros.
- Cada ocorrência recorrente é independente e pode ter valor, data, situação, categoria, conta e observação editados.
- Compras parceladas com geração automática das parcelas restantes.
- Possibilidade de iniciar um parcelamento em qualquer parcela, por exemplo, da parcela 3/10 até 10/10.
- Edição e exclusão individual de lançamentos.
- Filtros avançados por ciclo, período personalizado, tipo, situação, categoria, conta e faixa de valor.
- Cadastro, edição e exclusão de contas com saldo inicial e data de referência.
- Exclusão em cascata dos lançamentos vinculados à conta, mediante confirmação.
- Cadastro, edição e exclusão de categorias; lançamentos de categorias removidas são realocados para Outros.
- Saldo consolidado calculado até o final do ciclo selecionado.
- Lembretes locais para despesas pendentes.
- Bloqueio por biometria ou PIN.
- Tema claro como padrão e tema escuro persistente até nova alteração do usuário.
- Campos de data com máscara automática `dd/MM/aaaa` e validação de datas reais.
- Tela de splash com duração mínima de 3 segundos e três pontos animados.
- Modais próprios e consistentes com a identidade visual do aplicativo.
- Formulários e modais ajustam a rolagem automaticamente para manter o campo ativo visível acima do teclado.
- Seleção de categoria estabilizada no cadastro de lançamentos, inclusive após salvar uma movimentação.

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

Ao criar um lançamento recorrente, o usuário escolhe entre:

- **Quantidade definida:** gera de 2 a 60 ocorrências.
- **Sem limite:** cria inicialmente 12 ocorrências e amplia a série automaticamente quando ciclos futuros são consultados.

A primeira ocorrência usa a situação escolhida; as futuras são criadas como pendentes. Cada cobrança permanece independente e pode ter valor, data, categoria, conta, situação e observação editados separadamente. Isso atende contas contínuas e variáveis, como energia elétrica, aluguel, água e condomínio.

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

O snapshot persistido usa a versão 3. Dados anteriores são normalizados durante a inicialização.


## Exclusão de contas e categorias

- A exclusão de uma conta exige confirmação e remove todos os lançamentos vinculados, incluindo ocorrências recorrentes e parcelas já geradas.
- Todas as categorias ativas podem ser editadas.
- Ao excluir uma categoria, os lançamentos existentes são preservados e realocados para a categoria de segurança **Outros**.
- A categoria **Outros** pode ser renomeada, mas não pode ser excluída nem deixar de aceitar receitas e despesas.

## Teclado e formulários

As telas roláveis e os formulários em modal usam ajuste de teclado e rolagem para o campo focado. O espaço inferior é ampliado enquanto o teclado está aberto para evitar que campos e botões fiquem encobertos no Android e no iOS.
