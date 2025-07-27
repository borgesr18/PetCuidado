# PetCuidado 🐾

Sistema web moderno e escalável para acompanhamento da saúde de pets, incluindo consultas, vacinas, exames, prescrições e histórico clínico.

## 🎯 Sobre o Projeto

O PetCuidado permite que tutores e veterinários acompanhem a saúde de cães e gatos de forma organizada e segura, com diferentes níveis de acesso baseados em roles.

### Tipos de Usuários
- **Tutor**: Acompanha seus pets, agenda consultas, visualiza vacinas e prontuários
- **Veterinário**: Registra consultas, emite prescrições, acessa laudos e vacinas
- **Administrador**: Gerencia usuários, estatísticas e permissões

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticação**: Supabase Auth com roles
- **Estilo**: Design moderno e responsivo
- **Segurança**: Row Level Security (RLS) do Supabase

## 📦 Estrutura do Projeto

```
app/
  dashboard/          # Dashboard principal
  login/             # Página de login
  pets/              # Gerenciamento de pets
  consultas/         # Consultas e prontuários
  vacinas/           # Controle de vacinas
  prescricoes/       # Prescrições médicas
  admin/             # Painel administrativo
components/
  ui/                # Componentes ShadCN UI
  shared/            # Componentes compartilhados
  forms/             # Formulários
  cards/             # Cards de informação
  layout/            # Componentes de layout
lib/
  supabase.ts        # Cliente Supabase
  auth.ts            # Utilitários de autenticação
middleware.ts        # Middleware de autenticação
```

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/borgesr18/PetCuidado.git
cd PetCuidado/petcuidado
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🗄️ Configuração do Banco de Dados

Execute as queries SQL no painel do Supabase para criar as tabelas e políticas necessárias. Consulte o arquivo `DEPLOYMENT.md` para instruções detalhadas.

## 📱 Funcionalidades Implementadas

### ✅ Base do Projeto
- [x] Configuração Next.js 14 com App Router
- [x] Integração com Supabase
- [x] Sistema de autenticação
- [x] Middleware baseado em roles
- [x] Layout responsivo com sidebar e header
- [x] Página de login funcional

### 🔄 Em Desenvolvimento
- [ ] Cadastro e gerenciamento de pets
- [ ] Sistema de consultas e prontuários
- [ ] Controle de vacinas
- [ ] Gerenciamento de prescrições
- [ ] Upload de exames
- [ ] Notificações
- [ ] Relatórios e estatísticas

## 🔐 Segurança

O sistema utiliza:
- Autenticação via Supabase Auth
- Row Level Security (RLS) para proteção de dados
- Middleware para controle de acesso baseado em roles
- Validação de formulários com Zod
- Sanitização de dados

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

Consulte `DEPLOYMENT.md` para instruções detalhadas.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Rodrigo Borges - [@borgesr18](https://github.com/borgesr18)

Link do Projeto: [https://github.com/borgesr18/PetCuidado](https://github.com/borgesr18/PetCuidado)
