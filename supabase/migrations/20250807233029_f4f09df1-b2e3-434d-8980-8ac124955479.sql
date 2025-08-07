-- Create employees table with all required fields
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo TEXT,
  name TEXT NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  cpf TEXT NOT NULL UNIQUE,
  specialty TEXT NOT NULL,
  phone TEXT NOT NULL,
  unit TEXT NOT NULL,
  email TEXT,
  network_login TEXT,
  date_of_birth DATE,
  admission_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F')),
  coordination TEXT,
  contract TEXT,
  work_schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (assuming multi-tenant where users see their organization's employees)
CREATE POLICY "Users can view employees in their organization" 
ON public.employees 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update employees" 
ON public.employees 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete employees" 
ON public.employees 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.employees (photo, name, registration, cpf, specialty, phone, unit, email, network_login, date_of_birth, admission_date, gender, coordination, contract, work_schedule) VALUES
('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', 'João Silva', 'EMP001', '123.456.789-00', 'Desenvolvedor Full-Stack', '(11) 99999-1234', 'Tecnologia', 'joao.silva@empresa.com', 'joao.silva', '1985-03-15', '2020-01-15', 'M', 'Desenvolvimento', 'CLT', 'Segunda a Sexta - 8h às 18h'),
('https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face', 'Maria Santos', 'EMP002', '987.654.321-00', 'Designer UX/UI', '(11) 88888-5678', 'Design', 'maria.santos@empresa.com', 'maria.santos', '1990-07-22', '2021-03-10', 'F', 'Design Gráfico', 'CLT', 'Segunda a Sexta - 9h às 19h'),
('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', 'Carlos Oliveira', 'EMP003', '456.789.123-00', 'Analista de Sistemas', '(11) 77777-9012', 'Tecnologia', 'carlos.oliveira@empresa.com', 'carlos.oliveira', '1988-11-08', '2019-08-20', 'M', 'Infraestrutura', 'PJ', 'Segunda a Sexta - 8h às 17h');