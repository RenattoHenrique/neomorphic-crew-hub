import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Dados mock para demonstração (será substituído pelo Supabase)
const mockEmployees = [
  {
    id: "1",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    name: "João Silva",
    registration: "EMP001",
    cpf: "123.456.789-00",
    specialty: "Desenvolvedor Full-Stack",
    phone: "(11) 99999-1234",
    unit: "Tecnologia"
  },
  {
    id: "2", 
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face",
    name: "Maria Santos",
    registration: "EMP002",
    cpf: "987.654.321-00",
    specialty: "Designer UX/UI",
    phone: "(11) 88888-5678",
    unit: "Design"
  },
  {
    id: "3",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    name: "Carlos Oliveira",
    registration: "EMP003", 
    cpf: "456.789.123-00",
    specialty: "Analista de Sistemas",
    phone: "(11) 77777-9012",
    unit: "Tecnologia"
  }
];

const Index = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    toast({
      title: "Adicionar Funcionário",
      description: "Conecte ao Supabase para habilitar esta funcionalidade",
    });
  };

  const handleEditEmployee = (id: string) => {
    toast({
      title: "Editar Funcionário",
      description: "Conecte ao Supabase para habilitar esta funcionalidade",
    });
  };

  const handleDeleteEmployee = (id: string) => {
    toast({
      title: "Excluir Funcionário", 
      description: "Conecte ao Supabase para habilitar esta funcionalidade",
    });
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
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {employees.length} funcionários
              </Badge>
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
                      <img
                        src={employee.photo}
                        alt={employee.name}
                        className="w-12 h-12 rounded-full object-cover neo-card p-1"
                      />
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
                  <img
                    src={employee.photo}
                    alt={employee.name}
                    className="w-16 h-16 rounded-full object-cover neo-card p-1"
                  />
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
    </div>
  );
};

export default Index;