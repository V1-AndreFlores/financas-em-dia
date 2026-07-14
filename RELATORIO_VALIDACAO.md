# Relatório de Validação — Finanças em Dia 1.1.3

Data: 13/07/2026

## Escopo validado

- Correção da seleção de categorias no cadastro de lançamentos.
- Seleção automática da primeira categoria compatível quando o formulário não possui uma categoria válida.
- Alteração manual entre categorias de despesa e receita.
- Preservação da categoria escolhida após salvar um lançamento.
- Revalidação da categoria ao trocar o tipo entre despesa e receita.
- Preservação das funcionalidades da versão 1.1.2.

## Causa técnica

A tela derivava contas e categorias diretamente em seletores que criavam novos arrays durante as renderizações. Além disso, o formulário limpava a categoria após salvar e o efeito de validação podia deixar o cadastro temporariamente sem seleção.

A correção passou a:

- selecionar as coleções originais do Redux com referências estáveis;
- derivar contas ativas e categorias compatíveis por `useMemo`;
- revalidar a seleção com atualização funcional de estado;
- selecionar automaticamente a primeira categoria compatível quando necessário;
- manter a categoria e a conta válidas depois de salvar o lançamento.

## Resultados

- TypeScript estrito: aprovado.
- Bundle Web: aprovado.
- Bundle Android: aprovado.
- Bundle iOS: aprovado.
- Configuração pública do Expo: preservada.
- Nenhuma dependência adicionada.
- `package-lock.json` mantido sem referências ao registro interno.

## Teste funcional executado

O bundle Web foi carregado em navegador automatizado com estado local limpo e o seguinte fluxo foi validado:

1. abrir a tela Adicionar;
2. confirmar a seleção automática de Alimentação;
3. selecionar Moradia e verificar a mudança visual imediata;
4. preencher descrição e valor;
5. salvar o lançamento;
6. fechar a confirmação;
7. confirmar que Moradia permanece selecionada;
8. confirmar que o lançamento salvo utiliza Moradia.

Resultado: aprovado.

## Observações

- Não foram adicionados plugins ou dependências nativas.
- Não é obrigatório executar `npm ci` para aplicar esta atualização incremental.
- Um novo APK/AAB é necessário apenas para distribuir a versão 1.1.3 instalada.
- Auditoria npm: nenhuma vulnerabilidade alta ou crítica; permanecem alertas moderados transitivos do toolchain do Expo.
