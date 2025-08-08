import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  Users,
  Building,
  Phone,
  CreditCard,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeDetailsModal } from "@/components/employee/EmployeeDetailsModal";
import { EmployeeFormModal } from "@/components/employee/EmployeeFormModal";
import { Employee } from "@/types/employee";

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees((data || []) as Employee[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar funcionários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filtrar funcionários baseado no termo de busca
  const filteredEmployees = employees.filter(employee => 
    Object.values(employee).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Ordenar funcionários
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleEditEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setEditingEmployee(employee);
      setIsFormModalOpen(true);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Funcionário excluído",
        description: "O funcionário foi removido com sucesso.",
      });

      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir funcionário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEmployeePhotoClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const handleFormSuccess = () => {
    fetchEmployees();
  };

  const handleExport = (format: string) => {
    toast({
      title: `Exportar ${format.toUpperCase()}`,
      description: "Conecte ao Supabase para habilitar esta funcionalidade",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="neo-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-primary rounded-2xl text-primary-foreground">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Gestão de Funcionários
                </h1>
                <p className="text-muted-foreground">
                  Sistema completo de gerenciamento com design neomórfico
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {employees.length} funcionários
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="neo-card p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neo-input pl-10"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                onClick={handleAddEmployee}
                className="neo-button bg-gradient-primary text-primary-foreground hover:bg-gradient-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              
              <Button 
                variant="outline" 
                className="neo-button"
                onClick={() => handleExport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              
              <Button 
                variant="outline" 
                className="neo-button"
                onClick={() => handleExport('xlsx')}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              
              <Button 
                variant="outline" 
                className="neo-button"
                onClick={() => handleExport('ods')}
              >
                <Download className="h-4 w-4 mr-2" />
                ODS
              </Button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="neo-card overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('photo')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Foto
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Nome
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('registration')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Matrícula
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('cpf')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      CPF
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('specialty')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Especialidade
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('phone')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Telefone
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    <button
                      onClick={() => handleSort('unit')}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      Unidade
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border hover:bg-surface/50 transition-colors">
                     <td className="p-4">
                       <button
                         onClick={() => handleEmployeePhotoClick(employee)}
                         className="transition-transform hover:scale-105"
                       >
                         <img
                           src={employee.photo || '/placeholder.svg'}
                           alt={employee.name}
                           className="w-12 h-12 rounded-full object-cover neo-card p-1 cursor-pointer"
                         />
                       </button>
                     </td>
                    <td className="p-4 font-medium text-foreground">{employee.name}</td>
                    <td className="p-4 text-muted-foreground">{employee.registration}</td>
                    <td className="p-4 text-muted-foreground">{employee.cpf}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-accent/50 text-accent-foreground">
                        {employee.specialty}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{employee.phone}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {employee.unit}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="neo-button p-2 h-8 w-8"
                          onClick={() => handleEditEmployee(employee.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="neo-button p-2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {sortedEmployees.map((employee) => (
              <Card key={employee.id} className="neo-card p-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleEmployeePhotoClick(employee)}
                    className="transition-transform hover:scale-105"
                  >
                    <img
                      src={employee.photo || '/placeholder.svg'}
                      alt={employee.name}
                      className="w-16 h-16 rounded-full object-cover neo-card p-1 cursor-pointer"
                    />
                  </button>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-foreground">{employee.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="neo-button p-2 h-8 w-8"
                          onClick={() => handleEditEmployee(employee.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="neo-button p-2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        {employee.registration} • {employee.cpf}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {employee.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {employee.unit}
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="bg-accent/50 text-accent-foreground">
                      {employee.specialty}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {sortedEmployees.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum funcionário encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros de busca ou adicione novos funcionários.
              </p>
              <Button 
                onClick={handleAddEmployee}
                className="neo-button bg-gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Funcionário
              </Button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="neo-card p-4">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Sistema Neomórfico de Gestão</span>
            </div>
            <span>•</span>
            <span>Desenvolvido com React + Tailwind + Supabase</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <EmployeeFormModal
        employee={editingEmployee}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Index;