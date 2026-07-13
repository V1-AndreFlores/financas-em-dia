# Relatório de Validação — Finanças em Dia 1.0.3

Data: 13/07/2026

## Escopo validado

- Inclusão da tela visual de splash.
- Duração mínima de 3 segundos antes da navegação principal.
- Hidratação do estado Redux executada em paralelo com a splash.
- Permanência da splash quando a hidratação ultrapassa o tempo mínimo.
- Tratamento controlado de falhas de hidratação após a splash.
- Inclusão e resolução do asset `assets/images/splash.png`.
- Atualização do `app.json`, documentação e versão do projeto.

## Resultados

| Verificação | Resultado |
|---|---|
| TypeScript estrito (`tsc --noEmit`) | Aprovado |
| Bundle Web | Aprovado |
| Bundle Android | Aprovado |
| Bundle iOS | Aprovado |
| Inclusão da imagem no bundle Web | Aprovado |
| Inclusão da imagem no bundle Android | Aprovado |
| Inclusão da imagem no bundle iOS | Aprovado |
| Manifesto SHA-256 | Atualizado |

## Observações

- A splash permanece visível por no mínimo 3 segundos.
- Se a leitura ou normalização dos dados locais exigir mais tempo, a splash permanece até o bootstrap concluir.
- A imagem usa `resizeMode="cover"`; pequenas áreas das bordas podem ser cortadas conforme a proporção da tela.
- Alterações em imagens ou configurações nativas de splash exigem um novo build EAS para aparecerem no APK/AAB.
