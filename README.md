# PIX Gateway Connect - Svelte 5

Projeto convertido para Svelte 5 mantendo toda a lógica original do projeto React.

## Tecnologias

Este projeto foi construído com:

- **Svelte 5** - Framework reativo moderno com runes ($state, $derived, $effect)
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utility-first
- **Supabase** - Backend como serviço (BaaS) para pagamentos PIX
- **svelte-spa-router** - Roteamento client-side

## Estrutura do Projeto

```
src/
├── lib/
│   ├── components/     # Componentes UI reutilizáveis
│   │   ├── Button.svelte
│   │   ├── Checkbox.svelte
│   │   ├── Input.svelte
│   │   └── Progress.svelte
│   └── supabase.ts     # Cliente Supabase
├── routes/             # Páginas da aplicação
│   ├── Home.svelte     # Página inicial com timer
│   ├── Quiz.svelte     # Quiz de perguntas
│   ├── Wd.svelte       # Saldo disponível
│   ├── WdMethod.svelte # Método de saque
│   ├── Add.svelte      # Adicionar chave PIX
│   ├── ConfirmWd.svelte# Confirmar saque
│   ├── Confirm.svelte  # Confirmação e IOF
│   ├── Checkout.svelte # Pagamento PIX
│   └── NotFound.svelte # Página 404
├── App.svelte          # Componente raiz com router
├── main.ts             # Entry point
└── app.css             # Estilos globais
```

## Principais Diferenças do React

### 1. Reatividade com Runes (Svelte 5)

React:
```typescript
const [count, setCount] = useState(0);
```

Svelte 5:
```typescript
let count = $state(0);
```

### 2. Efeitos Colaterais

React:
```typescript
useEffect(() => {
  // código
}, [deps]);
```

Svelte 5:
```typescript
$effect(() => {
  // código
});
```

### 3. Valores Derivados

React:
```typescript
const doubled = useMemo(() => count * 2, [count]);
```

Svelte 5:
```typescript
let doubled = $derived(count * 2);
```

### 4. Binding Bidirecional

React:
```typescript
<input value={text} onChange={(e) => setText(e.target.value)} />
```

Svelte:
```svelte
<input bind:value={text} />
```

## Como Executar

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
```

5. Preview do build:
```bash
npm run preview
```

## Características Implementadas

- Welcome screen com animação
- Timer de 15 minutos
- Quiz interativo com 5 perguntas
- Sistema de navegação com múltiplas páginas
- Formulários com validação e máscaras (CPF, telefone)
- Integração com Supabase para pagamentos PIX
- Geração de QR Code PIX
- LocalStorage para persistência de dados
- Design responsivo e moderno

## Componentes Reutilizáveis

- **Button**: Botão customizável
- **Input**: Campo de entrada com binding
- **Checkbox**: Checkbox com estado
- **Progress**: Barra de progresso

## Notas Técnicas

O projeto utiliza as features mais modernas do Svelte 5:
- Runes para gerenciamento de estado
- Snippets para composição
- Sistema de eventos aprimorado
- TypeScript totalmente integrado

Todos os assets foram copiados do projeto original e a lógica de negócio foi mantida idêntica, apenas adaptada para a sintaxe do Svelte 5.
