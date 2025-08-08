import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";

const employeeSchema = z.object({
  photo: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  registration: z.string().min(1, "Matrícula é obrigatória"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  network_login: z.string().optional(),
  date_of_birth: z.string().optional(),
  admission_date: z.string().optional(),
  gender: z.enum(["M", "F"]).optional(),
  coordination: z.string().optional(),
  contract: z.string().optional(),
  work_schedule: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormModalProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmployeeFormModal = ({ employee, isOpen, onClose, onSuccess }: EmployeeFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee || {
      photo: "",
      name: "",
      registration: "",
      cpf: "",
      specialty: "",
      phone: "",
      unit: "",
      email: "",
      network_login: "",
      date_of_birth: "",
      admission_date: "",
      gender: undefined,
      coordination: "",
      contract: "",
      work_schedule: "",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      // Prepare data for database - ensure required fields are present
      const employeeData = {
        photo: data.photo || null,
        name: data.name,
        registration: data.registration,
        cpf: data.cpf,
        specialty: data.specialty,
        phone: data.phone,
        unit: data.unit,
        email: data.email || null,
        network_login: data.network_login || null,
        date_of_birth: data.date_of_birth || null,
        admission_date: data.admission_date || null,
        gender: data.gender || null,
        coordination: data.coordination || null,
        contract: data.contract || null,
        work_schedule: data.work_schedule || null,
      };

      if (employee?.id) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);

        if (error) throw error;

        toast({
          title: "Funcionário atualizado",
          description: "Os dados do funcionário foram atualizados com sucesso.",
        });
      } else {
        // Create new employee
        const { error } = await supabase
          .from('employees')
          .insert(employeeData);

        if (error) throw error;

        toast({
          title: "Funcionário criado",
          description: "Novo funcionário foi criado com sucesso.",
        });
      }

      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o funcionário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="neo-card max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {employee ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="photo">URL da Foto</Label>
                <Input
                  id="photo"
                  {...register("photo")}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="neo-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="neo-input"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration">Matrícula *</Label>
                <Input
                  id="registration"
                  {...register("registration")}
                  className="neo-input"
                />
                {errors.registration && (
                  <p className="text-sm text-destructive">{errors.registration.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  {...register("cpf")}
                  placeholder="000.000.000-00"
                  className="neo-input"
                />
                {errors.cpf && (
                  <p className="text-sm text-destructive">{errors.cpf.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="(11) 99999-9999"
                  className="neo-input"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="usuario@empresa.com"
                  className="neo-input"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Sexo</Label>
                <Select onValueChange={(value) => setValue("gender", value as "M" | "F")}>
                  <SelectTrigger className="neo-input">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register("date_of_birth")}
                  className="neo-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network_login">Login de Rede</Label>
                <Input
                  id="network_login"
                  {...register("network_login")}
                  placeholder="usuario.rede"
                  className="neo-input"
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Informações Profissionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade *</Label>
                <Input
                  id="specialty"
                  {...register("specialty")}
                  className="neo-input"
                />
                {errors.specialty && (
                  <p className="text-sm text-destructive">{errors.specialty.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <Input
                  id="unit"
                  {...register("unit")}
                  className="neo-input"
                />
                {errors.unit && (
                  <p className="text-sm text-destructive">{errors.unit.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordination">Coordenação</Label>
                <Input
                  id="coordination"
                  {...register("coordination")}
                  className="neo-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admission_date">Data de Admissão</Label>
                <Input
                  id="admission_date"
                  type="date"
                  {...register("admission_date")}
                  className="neo-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract">Tipo de Contrato</Label>
                <Select onValueChange={(value) => setValue("contract", value)}>
                  <SelectTrigger className="neo-input">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                    <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Escala de Trabalho */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Escala de Trabalho
            </h3>
            <div className="space-y-2">
              <Label htmlFor="work_schedule">Horário de Trabalho</Label>
              <Textarea
                id="work_schedule"
                {...register("work_schedule")}
                placeholder="Ex: Segunda a Sexta - 8h às 18h"
                className="neo-input"
                rows={3}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="neo-button"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="neo-button bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : employee ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};