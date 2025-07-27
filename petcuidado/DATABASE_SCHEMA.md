# PetCuidado - Schema do Banco de Dados

## Instruções para Criação Manual no Supabase

Como o MCP do Supabase está em modo somente leitura, execute as seguintes queries SQL no painel do Supabase:

### 1. Tabela de Perfis (profiles)

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'tutor', 'veterinario')),
  phone TEXT,
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

### 2. Tabela de Pets

```sql
-- Create pets table
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cao', 'gato')),
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(5,2),
  color TEXT,
  microchip TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pets" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Veterinarios can view assigned pets" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'veterinario'
    )
  );
```

### 3. Tabela de Consultas

```sql
-- Create consultas table
CREATE TABLE consultas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  veterinario_id UUID REFERENCES auth.users(id) NOT NULL,
  tutor_id UUID REFERENCES auth.users(id) NOT NULL,
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  motivo TEXT NOT NULL,
  sintomas TEXT,
  diagnostico TEXT,
  tratamento TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tutors can view own pet consultas" ON consultas
  FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Veterinarios can view assigned consultas" ON consultas
  FOR SELECT USING (auth.uid() = veterinario_id);

CREATE POLICY "Veterinarios can insert consultas" ON consultas
  FOR INSERT WITH CHECK (auth.uid() = veterinario_id);

CREATE POLICY "Veterinarios can update assigned consultas" ON consultas
  FOR UPDATE USING (auth.uid() = veterinario_id);

CREATE POLICY "Admins can view all consultas" ON consultas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 4. Tabela de Vacinas

```sql
-- Create vacinas table
CREATE TABLE vacinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  nome_vacina TEXT NOT NULL,
  data_aplicacao DATE NOT NULL,
  proxima_dose DATE,
  veterinario_id UUID REFERENCES auth.users(id),
  lote TEXT,
  fabricante TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vacinas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pet owners can view pet vacinas" ON vacinas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vacinas.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Veterinarios can view all vacinas" ON vacinas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('veterinario', 'admin')
    )
  );

CREATE POLICY "Veterinarios can insert vacinas" ON vacinas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('veterinario', 'admin')
    )
  );

CREATE POLICY "Veterinarios can update vacinas" ON vacinas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('veterinario', 'admin')
    )
  );
```

### 5. Tabela de Prescrições

```sql
-- Create prescricoes table
CREATE TABLE prescricoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consulta_id UUID REFERENCES consultas(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  veterinario_id UUID REFERENCES auth.users(id) NOT NULL,
  medicamento TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  frequencia TEXT NOT NULL,
  duracao TEXT NOT NULL,
  instrucoes TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'suspensa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prescricoes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pet owners can view pet prescricoes" ON prescricoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = prescricoes.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Veterinarios can view assigned prescricoes" ON prescricoes
  FOR SELECT USING (auth.uid() = veterinario_id);

CREATE POLICY "Veterinarios can insert prescricoes" ON prescricoes
  FOR INSERT WITH CHECK (auth.uid() = veterinario_id);

CREATE POLICY "Veterinarios can update assigned prescricoes" ON prescricoes
  FOR UPDATE USING (auth.uid() = veterinario_id);

CREATE POLICY "Admins can view all prescricoes" ON prescricoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 6. Tabela de Exames

```sql
-- Create exames table
CREATE TABLE exames (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consulta_id UUID REFERENCES consultas(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  veterinario_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo_exame TEXT NOT NULL,
  data_exame DATE NOT NULL,
  resultado TEXT,
  arquivo_url TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'em_andamento', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exames ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pet owners can view pet exames" ON exames
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = exames.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Veterinarios can view all exames" ON exames
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('veterinario', 'admin')
    )
  );

CREATE POLICY "Veterinarios can insert exames" ON exames
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('veterinario', 'admin')
    )
  );

CREATE POLICY "Veterinarios can update exames" ON exames
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('veterinario', 'admin')
    )
  );
```

### 7. Índices para Performance

```sql
-- Create indexes for better performance
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_consultas_pet_id ON consultas(pet_id);
CREATE INDEX idx_consultas_veterinario_id ON consultas(veterinario_id);
CREATE INDEX idx_consultas_tutor_id ON consultas(tutor_id);
CREATE INDEX idx_consultas_data ON consultas(data_consulta);
CREATE INDEX idx_vacinas_pet_id ON vacinas(pet_id);
CREATE INDEX idx_vacinas_proxima_dose ON vacinas(proxima_dose);
CREATE INDEX idx_prescricoes_pet_id ON prescricoes(pet_id);
CREATE INDEX idx_prescricoes_veterinario_id ON prescricoes(veterinario_id);
CREATE INDEX idx_prescricoes_status ON prescricoes(status);
CREATE INDEX idx_exames_pet_id ON exames(pet_id);
CREATE INDEX idx_exames_veterinario_id ON exames(veterinario_id);
CREATE INDEX idx_exames_status ON exames(status);
```

## Resumo das Tabelas

1. **profiles** - Perfis de usuários com roles (admin, tutor, veterinario)
2. **pets** - Cadastro de pets vinculados aos tutores
3. **consultas** - Consultas veterinárias agendadas e realizadas
4. **vacinas** - Histórico de vacinação dos pets
5. **prescricoes** - Prescrições médicas vinculadas às consultas
6. **exames** - Exames solicitados e resultados

## Políticas de Segurança (RLS)

- **Tutores**: Veem apenas seus próprios pets e dados relacionados
- **Veterinários**: Veem pets atribuídos e podem criar/editar consultas, prescrições e exames
- **Administradores**: Acesso completo a todos os dados

## Próximos Passos

1. Execute as queries SQL no painel do Supabase
2. Teste a criação de usuários e pets
3. Verifique se as políticas RLS estão funcionando corretamente
4. Configure as URLs de autenticação no Supabase para o domínio do Vercel
