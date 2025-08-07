import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Monitor, 
  Calendar, 
  CalendarDays,
  Users,
  Building,
  Phone,
  CreditCard,
  FileText,
  Clock
} from "lucide-react";

import { Employee } from "@/types/employee";

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeDetailsModal = ({ employee, isOpen, onClose }: EmployeeDetailsModalProps) => {
  if (!employee) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getGenderDisplay = (gender?: string) => {
    if (gender === 'M') return 'Masculino';
    if (gender === 'F') return 'Feminino';
    return 'Não informado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="neo-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-xl text-primary-foreground">
              <User className="h-6 w-6" />
            </div>
            Detalhes do Funcionário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Header com foto e informações básicas */}
          <div className="flex items-start gap-6">
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-24 h-24 rounded-full object-cover neo-card p-1"
            />
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{employee.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>{employee.registration}</span>
              </div>
              <Badge variant="secondary" className="bg-accent/50 text-accent-foreground">
                {employee.specialty}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Informações de contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Telefone</span>
                </div>
                <p className="font-medium text-foreground">{employee.phone}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>E-mail</span>
                </div>
                <p className="font-medium text-foreground">{employee.email || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Informações pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>CPF</span>
                </div>
                <p className="font-medium text-foreground">{employee.cpf}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Sexo</span>
                </div>
                <p className="font-medium text-foreground">{getGenderDisplay(employee.gender)}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Data de Nascimento</span>
                </div>
                <p className="font-medium text-foreground">{formatDate(employee.date_of_birth)}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="h-4 w-4" />
                  <span>Login de Rede</span>
                </div>
                <p className="font-medium text-foreground">{employee.network_login || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Informações profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Informações Profissionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Unidade</span>
                </div>
                <p className="font-medium text-foreground">{employee.unit}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Coordenação</span>
                </div>
                <p className="font-medium text-foreground">{employee.coordination || "Não informado"}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Data de Admissão</span>
                </div>
                <p className="font-medium text-foreground">{formatDate(employee.admission_date)}</p>
              </div>
              <div className="neo-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Tipo de Contrato</span>
                </div>
                <p className="font-medium text-foreground">{employee.contract || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Escala de trabalho */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Escala de Trabalho
            </h3>
            <div className="neo-card p-4">
              <p className="font-medium text-foreground">{employee.work_schedule || "Não informado"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};