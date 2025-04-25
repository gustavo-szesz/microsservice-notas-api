# Microsservice Notas API

Uma API para gerenciamento de notas acadêmicas, construída como um microsserviço utilizando NestJS.

## Visão Geral

Este microsserviço gerencia notas de alunos, oferecendo operações CRUD com recursos avançados de resiliência, incluindo:

- Cache com Redis
- Circuit Breaker para lidar com falhas em serviços externos
- Retry com backoff exponencial
- Documentação automática com Swagger

## Tecnologias Utilizadas

- NestJS
- MongoDB (via Mongoose)
- Redis (cache)
- Docker & Docker Compose
- TypeScript

## Pré-requisitos

- Node.js (v14+)
- Docker e Docker Compose
- MongoDB (ou container Docker)
- Redis (ou container Docker)

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositório>
cd microsservice-notas-api

# Instalar dependências
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Servidor
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/notas

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Serviços externos
LOGIN_SERVICE_URL=http://login-service:3001
CONTEUDO_SERVICE_URL=http://conteudo-service:3002
```

## Execução da Aplicação

### Desenvolvimento

```bash
# Modo de desenvolvimento
npm run start:dev

# Compilação
npm run build

# Modo de produção
npm run start:prod
```

### Docker

```bash
# Construir e iniciar todos os containers
docker-compose up -d

# Verificar logs
docker-compose logs -f api

# Parar todos os containers
docker-compose down
```

## Documentação da API

A documentação Swagger está disponível em:

```
http://localhost:3000/api/docs
```

Através dela você pode:
- Visualizar todos os endpoints disponíveis
- Testar as requisições diretamente pelo navegador
- Ver os modelos de dados e parâmetros necessários

## Estrutura do Projeto

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Ponto de entrada da aplicação
├── cache/                     # Gerenciamento de cache
├── integration/               # Integrações com serviços externos
│   ├── circuit-breaker/       # Implementação do padrão Circuit Breaker
│   ├── login/                 # Serviço de integração com autenticação
│   └── retry/                 # Serviço de retry com backoff exponencial
├── notas/                     # Módulo principal de notas
│   ├── dto/                   # Objetos de transferência de dados
│   ├── entities/              # Entidades do MongoDB
│   ├── interfaces/            # Interfaces e tipos
│   ├── notas.controller.ts    # Controlador REST
│   └── notas.service.ts       # Lógica de negócio
└── conteudo/                  # Integração com serviço de conteúdo
```

## Funcionalidades

- **Gerenciamento de notas**: CRUD completo
- **Filtragem**: Busca por aluno ou conteúdo
- **Caching**: Resultados em cache para melhorar performance
- **Resiliência**: Circuit breaker para evitar falhas em cascata
- **Retry**: Tentativas automáticas com intervalos exponenciais

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de código
npm run test:cov
```

## Monitoramento

A aplicação está configurada para logging detalhado, facilitando o diagnóstico de problemas.

## Segurança

A API implementa:
- Validação de dados com class-validator
- Sanitização de entradas
- CORS configurado
- Compressão para melhor performance

## Licença

MIT
