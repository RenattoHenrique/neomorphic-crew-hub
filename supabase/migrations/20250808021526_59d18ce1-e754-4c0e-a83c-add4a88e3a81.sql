-- Remover as políticas RLS restritivas atuais
DROP POLICY IF EXISTS "Users can view employees in their organization" ON public.employees;
DROP POLICY IF EXISTS "Users can create employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete employees" ON public.employees;

-- Criar políticas RLS mais permissivas para uso interno/público
-- (Para um sistema interno de gestão de funcionários)

-- Permitir visualização pública de funcionários
CREATE POLICY "Anyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

-- Permitir criação pública de funcionários  
CREATE POLICY "Anyone can create employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

-- Permitir atualização pública de funcionários
CREATE POLICY "Anyone can update employees" 
ON public.employees 
FOR UPDATE 
USING (true);

-- Permitir exclusão pública de funcionários
CREATE POLICY "Anyone can delete employees" 
ON public.employees 
FOR DELETE 
USING (true);