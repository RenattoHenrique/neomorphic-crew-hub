import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface Employee {
  id?: string;
  name: string;
  photo?: string | null;
}

const App = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const handleAddEmployee = (employee: Employee, file: File | null) => {
    // Simula salvamento local (substitua por lógica de salvamento no Supabase)
    const newEmployee = { ...employee, id: Math.random().toString() };
    setEmployees([...employees, newEmployee]);

    // Lógica para upload do arquivo (ex.: salvar no Supabase Storage)
    if (file) {
      console.log("Arquivo para upload:", file);
      // Exemplo de integração com Supabase:
      /*
      import { supabase } from './supabase';
      const { data, error } = await supabase.storage
        .from('employee-photos')
        .upload(`photos/${newEmployee.id}.png`, file);
      if (!error) {
        const photoUrl = supabase.storage.from('employee-photos').getPublicUrl(`photos/${newEmployee.id}.png`).data.publicUrl;
        setEmployees([...employees, { ...newEmployee, photo: photoUrl }]);
      }
      */
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<Index employees={employees} onAddEmployee={handleAddEmployee} />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
