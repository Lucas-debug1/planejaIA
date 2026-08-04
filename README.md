# Planej.ai — Educador Financeiro Inteligente

Aplicação web de planejamento financeiro pessoal construída com **React**, **TypeScript**, **Vite** e **Tailwind CSS**, que usa **IA generativa** (Google Gemini) para transformar os dados de uma simulação financeira em um diagnóstico personalizado, com sugestões práticas, ideias de renda extra e um plano de ação.

Projeto desenvolvido como desafio de código da trilha **"Desenvolvendo Seu Educador Financeiro Inteligente Com React E IA Generativa"** (DIO), a partir do repositório base [digitalinnovationone/planejai](https://github.com/digitalinnovationone/planejai).

## O que o projeto faz

1. A pessoa usuária preenche um formulário em etapas com renda, gastos fixos, dívidas e uma meta financeira (nome, valor e prazo).
2. Os dados são salvos no `localStorage` do navegador — não há backend nem banco de dados.
3. Na página de resultado, um prompt estruturado é montado com os dados da simulação e enviado para a API do **Google Gemini**.
4. A IA retorna um diagnóstico em JSON (viabilidade da meta, análise do orçamento, sugestões, ideias de renda extra, sugestões de investimento e uma mensagem motivacional), que é exibido de forma amigável na tela.
5. Estados de carregamento (skeleton) e erro (com botão de tentar novamente) são tratados, e chamadas duplicadas à API são evitadas.

### Melhorias implementadas (desafios do repositório base)

- **Desafio 1 — Histórico de simulações** (`/historico`): lista todas as simulações salvas, com resumo da meta, data e economia mensal necessária; permite excluir uma simulação e navegar para os detalhes/insights já gerados.
- **Desafio 2 — Conversando com o educador financeiro**: dentro do card de insights, um chat permite fazer perguntas de acompanhamento sobre a simulação. As perguntas e respostas ficam salvas no `localStorage` por simulação, com scroll automático e feedback de carregamento/erro.

## Tecnologias usadas

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- lucide-react (ícones)
- react-loading-skeleton
- API do Google Gemini (`gemini-flash-latest`)

## Como executar

```bash
# instalar dependências
pnpm install # ou npm install / yarn

# configurar a chave da API do Gemini
cp .env.example .env.local
# edite .env.local e defina VITE_GEMINI_API_KEY com sua chave gerada em https://aistudio.google.com/

# rodar em desenvolvimento
pnpm dev
```

A aplicação sobe em `http://localhost:5173`.

## Como testar o fluxo principal

1. Acesse a rota `/`, preencha o formulário de 6 etapas (renda, gastos, dívidas, nome/valor/prazo da meta).
2. Ao concluir, você é redirecionado para `/resultado/:id`, onde os cards de resumo aparecem imediatamente e o painel de IA mostra o skeleton de carregamento até a resposta do Gemini chegar.
3. Use o campo de chat abaixo do diagnóstico para fazer perguntas de acompanhamento.
4. Acesse `/historico` para ver todas as simulações já feitas, reabrir os detalhes ou excluir uma simulação.

## Estrutura de pastas

```
src/
├── components/
│   ├── features/
│   │   ├── Insights/            # Estados do painel de IA (conteúdo, erro, chat)
│   │   ├── Simulation/          # Formulário multi-step
│   │   └── SimulationResults/   # Cards e painel de insights da página de resultado
│   ├── layout/                  # RootLayout (Header + Outlet)
│   └── shared/                  # Button, Input, Divider, Header, PageHero
├── context/theme/                # Contexto de tema claro/escuro
├── data/                         # Configuração do formulário e montagem dos prompts de IA
├── hooks/                        # useTheme, useSimulationStorage, useInsight, useConversation
├── pages/                        # Páginas de formulário, resultado e histórico
├── services/                     # Integração HTTP com a API do Gemini
├── styles/theme.css              # Tokens de cor (tema claro/escuro)
└── utils/                        # Máscara/parse de moeda, cálculo de economia mensal
```

## O que foi aprendido durante o desafio

- Como estruturar um formulário multi-step em React controlando estado, validação e reset de campos via `key`.
- Como implementar tema claro/escuro persistente com Context API, `localStorage` e preferência do sistema operacional (`prefers-color-scheme`).
- Como montar um prompt estruturado (papel, contexto, dados, schema de saída e regras de restrição) para obter respostas confiáveis e parseáveis de um modelo de IA generativa.
- Como tratar o ciclo completo de uma chamada assíncrona a uma API externa no front-end: loading, erro, retry e prevenção de chamadas duplicadas (React Strict Mode).
- Como persistir e recuperar dados estruturados (simulações, insights e conversas) usando apenas `localStorage`, sem backend.
