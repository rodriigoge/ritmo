# Ritmo

Ritmo e um aplicativo mobile simples para criar, organizar e acompanhar tarefas recorrentes no ritmo de cada pessoa.

## Estrutura

```text
ritmo/
├── apps/
│   └── mobile/        # React Native + Expo
├── packages/
│   └── shared/        # tipos compartilhados, futuramente
└── README.md
```

## Story 1 - Base mobile

A base inicial do app mobile ja inclui:

- Expo com TypeScript em `apps/mobile`
- Estrutura de pastas para app, navegacao, telas, tema e componentes
- Navegacao inicial com tabs para Hoje, Tarefas e Ajustes
- Tema global com suporte automatico a claro/escuro
- Paleta do produto: `#F0EFF4`, `#EEDBD1`, `#1E1E1E`
- Fonte Bricolage Grotesque configurada via `@expo-google-fonts/bricolage-grotesque`

## Comandos

Instale as dependencias antes de executar o app:

```bash
npm install
```

Execute o projeto mobile:

```bash
npm run mobile
```

Validacao de TypeScript:

```bash
npm run mobile:typecheck
```
