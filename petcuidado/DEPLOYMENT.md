# PetCuidado - Guia de Deploy no Vercel

## 🚀 Configuração do Deploy

### 1. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Configuração do Supabase

**Projeto Supabase:**
- **ID**: `your-project-id`
- **URL**: `https://your-project-id.supabase.co`
- **Região**: `sa-east-1`
- **Status**: Configure conforme seu projeto

### 3. Configuração do Banco de Dados

Antes do primeiro deploy, execute as seguintes queries no SQL Editor do Supabase:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tutor', 'veterinario')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tutor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Configuração de Domínio (Opcional)

Para configurar um domínio personalizado:
1. Acesse o painel do Vercel
2. Vá em Settings > Domains
3. Adicione seu domínio personalizado
4. Configure os DNS conforme instruções

### 5. Comandos de Deploy

O deploy é automático via Git, mas você pode usar os comandos:

```bash
# Build local para testar
npm run build

# Deploy manual (se necessário)
vercel --prod
```

### 6. Configurações de Segurança

**URLs Permitidas no Supabase:**
- Adicione o domínio do Vercel nas configurações de Auth
- Configure as URLs de redirect adequadamente

**Exemplo de URLs:**
- Site URL: `https://pet-cuidado.vercel.app`
- Redirect URLs: `https://pet-cuidado.vercel.app/auth/callback`

### 7. Monitoramento

- Logs disponíveis no painel do Vercel
- Métricas de performance automáticas
- Alertas de erro configuráveis

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Schema do banco de dados criado no Supabase
- [ ] URLs de redirect configuradas no Supabase Auth
- [ ] Build local testado com sucesso
- [ ] Deploy realizado e testado
- [ ] Login funcionando na versão de produção
- [ ] Navegação e roles funcionando corretamente

## 🔧 Troubleshooting

**Erro de autenticação:**
- Verifique as variáveis de ambiente
- Confirme as URLs no painel do Supabase

**Erro de build:**
- Execute `npm run build` localmente
- Verifique se todas as dependências estão no package.json

**Erro de banco de dados:**
- Confirme que o schema foi criado
- Verifique as políticas RLS
