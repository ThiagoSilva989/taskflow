# TaskFlow — Frontend

Frontend acadêmico de gerenciamento de tarefas feito com React, Vite, JavaScript e CSS.

## Requisitos
- Node.js 18 ou superior
- API AWS já implantada e acessível

## Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta `taskflow-frontend` no VS Code.
3. No terminal, execute:

```bash
npm install
```

4. Copie `.env.example` para `.env` (ou mantenha a URL padrão configurada em `src/services/api.js`).
5. Execute:

```bash
npm run dev
```

6. Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.

## API utilizada
Base URL: `https://ao6583pb6e.execute-api.us-east-1.amazonaws.com`

Rotas:
- `GET /tarefas`
- `GET /tarefas/{id}`
- `POST /tarefas`
- `PUT /tarefas/{id}`
- `DELETE /tarefas/{id}`

O frontend envia e espera tarefas com os campos `id`, `titulo`, `descricao`, `status` e `prioridade`. Campos adicionais retornados pela API são preservados.

## Importante: CORS
Se o navegador apresentar erro de CORS, habilite CORS na API HTTP do API Gateway para a origem `http://localhost:5173`, métodos `GET, POST, PUT, DELETE, OPTIONS` e cabeçalhos `content-type`. Depois, implante as alterações da API, se o console solicitar.

O projeto não cria backend nem banco de dados. Toda persistência é feita pela API AWS existente.
# taskflow
