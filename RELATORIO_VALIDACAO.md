# Relatório de Validação — Finanças em Dia 1.1.1

Data: 13/07/2026

## Escopo validado

- Máscara automática de datas no formato `dd/MM/aaaa`.
- Validação de datas incompletas e datas inexistentes.
- Aplicação da máscara nos cadastros, edição de lançamentos, saldo inicial e filtros avançados.
- Remoção da opção de tema “Sistema”.
- Tema claro como padrão para novas instalações.
- Persistência das opções Claro e Escuro.
- Migração de ajustes antigos com tema “Sistema” para Claro.
- Preservação das funcionalidades da versão 1.1.0.

## Resultados

- TypeScript estrito: aprovado.
- Bundle Web: aprovado.
- Bundle Android: aprovado.
- Bundle iOS: aprovado.
- Campos de data localizados no projeto usando o componente reutilizável `DateInput`.
- Persistência do tema mantida pelo listener Redux existente.
- Referências ao tema “Sistema” restritas à migração de snapshots antigos.
- Referências a registro npm interno no `package-lock.json`: zero.

## Casos de validação de data

- `20072026` é formatado como `20/07/2026`.
- `20/07/2026` é aceito.
- `31/02/2026` é rejeitado.
- `29/02/2025` é rejeitado.
- `29/02/2024` é aceito.
- Datas incompletas exibem orientação para completar `dd/MM/aaaa`.

## Observações

- A validação final continua ocorrendo antes de salvar ou aplicar filtros, mesmo que o usuário não retire o foco do campo.
- A indicação inline é exibida depois que um campo parcialmente preenchido perde o foco.
- Não foram adicionadas novas dependências nativas nesta atualização; não é obrigatório gerar novo APK apenas por causa desta alteração, embora um novo build seja necessário para distribuir a versão atualizada.
