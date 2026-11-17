# Design System

Fundação clara e editorial, sem provider de tema ou biblioteca de UI.
Inter é incluída no bundle e carregada antes das telas, sem acesso à rede.
Importe cada componente e token pelo seu arquivo. Não há showcase/rota no aplicativo.

## Tokens

- `colors`: background, surface, textPrimary, textSecondary, textMuted, border,
  habitCard, accent, completed, inactive, danger, onAction e floatingAction.
  Papéis de marca: canvas (fundo branco), ink (traço da logo e do mascote) e
  brand (azul do ponto da logo), usados no onboarding e nas ilustrações.
  As cores são definidas por função visual nos componentes.
- `typography`: display 40, title 28, habitName 20, metric 36, body 16, label 13,
  caption 12. Todos usam Inter: regular para texto e métricas, semibold para
  títulos e ações, bold para nomes de hábitos. Font scaling permanece habilitado
  e textos podem quebrar linha.
- `spacing`: 4, 8, 12, 16, 24, 32, 48.
- `radius`: control 12, round 24.
- `controls`: área de toque 52, ícone padrão 24, ícone de toolbar 32,
  ícone flutuante 18 e opacidades de pressed/disabled.

Sem dark mode, sombras, gradientes ou tokens de animação sem uso.

## APIs

- `Button`: `label`, `onPress`, `disabled?`, `variant?` (`primary`, `secondary`, `outline`
  ou `danger`), `loading?` (spinner, bloqueia toques e expõe `busy`), `icon?` (decorativo,
  antes do texto), `shape?` (`rounded` ou `pill`), `accessibilityHint?`, `testID?`. Label também é
  seu nome acessível. `pill` é a ação de página inteira do onboarding.
- `Logo`: `height?` (padrão 24). Porte vetorial de `assets/img/ritmo-logo.svg`,
  recortado ao wordmark, com nome acessível "Ritmo". Depende de react-native-svg.
- `IconButton`: `accessibilityLabel` e `renderIcon({ color, size })` obrigatórios;
  `onPress`, `disabled?`, `accessibilityHint?`, `testID?`, `variant?` (`default` ou `floating`),
  `iconSize?` e `iconAlignment?` (`center`, `start` ou `end`). O renderer permite usar um
  ícone já disponível no chamador sem acoplar esta base a uma biblioteca. O desenho
  interno fica fora da árvore acessível; o botão expõe a ação nomeada.
- `TextField`: `value`, `onChangeText`, `label` (ou `accessibilityLabel` obrigatório
  se não houver label), `placeholder?`, `error?`, `disabled?`. Encaminha `ref` para
  foco nativo e opções de teclado: `keyboardType`, `returnKeyType`, `autoFocus`,
  `autoCapitalize`, `autoCorrect`, `maxLength`, `onSubmitEditing`, `onFocus`, `onBlur`.
  Também aceita `accessibilityHint`, `testID`, `secureTextEntry`, `textContentType` e
  `autoComplete` (senhas e preenchimento automático). Erro é texto local com semântica de
  alerta e participa da dica acessível. Não aplica validação de domínio.
- `Divider`: sem props; linha decorativa discreta, sem ocupar a árvore acessível.

Button usa superfície escura como ação principal e superfície neutra como ação
secundária. Pressed tem feedback de opacidade; IconButton também muda a superfície.
TextField mantém foco perceptível por espessura e cor da borda. Disabled bloqueia a
interação/edição e é exposto semanticamente, além do feedback visual.

## Verificação

```sh
npm test -- designSystem.test.tsx
```

Testes verificam rótulos, ações, bloqueio disabled, edição controlada, mensagens de
erro, callbacks nativos de foco/teclado e renderização do separador. Não utilizam
snapshots de estilos. A validação visual em dispositivo continua necessária para
avaliar teclado, fontes nativas, leitor de tela e escala de fonte real.
