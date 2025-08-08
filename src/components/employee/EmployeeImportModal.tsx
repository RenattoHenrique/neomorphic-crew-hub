import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import * as XLSX from 'xlsx';
import { Employee } from "@/types/employee";

interface ImportResult {
  success: number;
  errors: { row: number; error: string; data?: any }[];
  total: number;
}

interface EmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmployeeImportModal = ({ isOpen, onClose, onSuccess }: EmployeeImportModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const parseExcelData = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Remove header row and empty rows
          const rows = jsonData.slice(1).filter((row: any) => row.length > 0 && row.some((cell: any) => cell !== null && cell !== undefined && cell !== ''));
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateEmployee = (data: any[], rowIndex: number): { isValid: boolean; employee?: Partial<Employee>; error?: string } => {
    try {
      // Mapear colunas conforme a ordem do export
      // [Nome, Matrícula, CPF, Especialidade, Telefone, Unidade, Email, Login de Rede, Data de Nascimento, Sexo, Data de Admissão, Coordenação, Contrato, Horário de Trabalho]
      const [
        name, registration, cpf, specialty, phone, unit, email, network_login, 
        date_of_birth, gender, admission_date, coordination, contract, work_schedule, photo
      ] = data;

      // Validar campos obrigatórios
      if (!name || !registration || !cpf || !specialty || !phone || !unit) {
        return {
          isValid: false,
          error: `Campos obrigatórios faltando: ${[
            !name && 'Nome',
            !registration && 'Matrícula',
            !cpf && 'CPF',
            !specialty && 'Especialidade',
            !phone && 'Telefone',
            !unit && 'Unidade'
          ].filter(Boolean).join(', ')}`
        };
      }

      // Converter e validar datas
      const formatDate = (dateValue: any) => {
        if (!dateValue) return null;
        
        // Se é um número (data do Excel)
        if (typeof dateValue === 'number') {
          const date = XLSX.SSF.parse_date_code(dateValue);
          return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
        
        // Se é string, tentar parsear
        if (typeof dateValue === 'string') {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        
        return null;
      };

      // Validar e converter sexo
      const normalizeGender = (genderValue: any): "M" | "F" | null => {
        if (!genderValue) return null;
        const genderStr = String(genderValue).toLowerCase();
        if (genderStr === 'masculino' || genderStr === 'm') return 'M';
        if (genderStr === 'feminino' || genderStr === 'f') return 'F';
        return null;
      };

      const employee: Partial<Employee> = {
        name: String(name).trim(),
        registration: String(registration).trim(),
        cpf: String(cpf).trim(),
        specialty: String(specialty).trim(),
        phone: String(phone).trim(),
        unit: String(unit).trim(),
        email: email ? String(email).trim() : null,
        network_login: network_login ? String(network_login).trim() : null,
        date_of_birth: formatDate(date_of_birth),
        gender: normalizeGender(gender),
        admission_date: formatDate(admission_date),
        coordination: coordination ? String(coordination).trim() : null,
        contract: contract ? String(contract).trim() : null,
        work_schedule: work_schedule ? String(work_schedule).trim() : null,
        photo: photo ? String(photo).trim() : null,
      };

      return { isValid: true, employee };
    } catch (error) {
      return {
        isValid: false,
        error: `Erro ao processar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setImportResult(null);

    try {
      // Processar arquivo
      const rows = await parseExcelData(selectedFile);
      
      if (rows.length === 0) {
        throw new Error("Arquivo vazio ou sem dados válidos");
      }

      const results: ImportResult = {
        success: 0,
        errors: [],
        total: rows.length
      };

      // Processar cada linha
      for (let i = 0; i < rows.length; i++) {
        const rowNumber = i + 2; // +2 porque começamos da linha 2 (considerando header)
        
        try {
          const validation = validateEmployee(rows[i], rowNumber);
          
          if (!validation.isValid) {
            results.errors.push({
              row: rowNumber,
              error: validation.error || 'Dados inválidos',
              data: rows[i]
            });
            continue;
          }

          // Inserir no banco de dados
          const { error } = await supabase
            .from('employees')
            .insert(validation.employee as any);

          if (error) {
            results.errors.push({
              row: rowNumber,
              error: `Erro no banco: ${error.message}`,
              data: rows[i]
            });
          } else {
            results.success++;
          }
        } catch (error) {
          results.errors.push({
            row: rowNumber,
            error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            data: rows[i]
          });
        }

        // Atualizar progresso
        setProgress(((i + 1) / rows.length) * 100);
      }

      setImportResult(results);

      if (results.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} funcionários importados com sucesso`,
        });
        onSuccess();
      }

      if (results.errors.length > 0) {
        toast({
          title: "Importação com erros",
          description: `${results.errors.length} registros com erro. Verifique o relatório.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setProgress(0);
    onClose();
  };

  const downloadTemplate = () => {
    // Criar planilha modelo
    const template = [
      [
        'Nome', 'Matrícula', 'CPF', 'Especialidade', 'Telefone', 'Unidade', 
        'Email', 'Login de Rede', 'Data de Nascimento', 'Sexo', 'Data de Admissão', 
        'Coordenação', 'Contrato', 'Horário de Trabalho', 'Foto (URL)'
      ],
      [
        'João Silva', '12345', '123.456.789-00', 'Desenvolvedor', '(11) 99999-9999', 'TI',
        'joao@empresa.com', 'joao.silva', '1990-01-15', 'M', '2023-01-01',
        'Coordenação TI', 'CLT', 'Segunda a Sexta - 9h às 18h', 'https://exemplo.com/foto.jpg'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários');
    XLSX.writeFile(wb, 'modelo_funcionarios.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="neo-card max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Importar Funcionários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Instruções */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Instruções de Importação</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use arquivos Excel (.xlsx, .xls) ou CSV (.csv)</li>
              <li>• A primeira linha deve conter os cabeçalhos das colunas</li>
              <li>• Campos obrigatórios: Nome, Matrícula, CPF, Especialidade, Telefone, Unidade</li>
              <li>• Formato de data: AAAA-MM-DD ou use o formato do Excel</li>
              <li>• Sexo: "M" ou "Masculino" para masculino, "F" ou "Feminino" para feminino</li>
            </ul>
          </div>

          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Modelo de Planilha</h4>
                <p className="text-sm text-muted-foreground">
                  Baixe o modelo com exemplo de dados
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="neo-button">
              Baixar Modelo
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="text-lg font-semibold">
              Selecionar Arquivo
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                  <p className="text-foreground font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="neo-button"
                  >
                    Trocar Arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-foreground">Clique para selecionar um arquivo</p>
                  <p className="text-sm text-muted-foreground">
                    Arquivos suportados: .xlsx, .xls, .csv
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="neo-button"
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Results */}
          {importResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Resultado da Importação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">{importResult.success}</p>
                  <p className="text-sm text-success">Sucessos</p>
                </div>
                
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <X className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-destructive">{importResult.errors.length}</p>
                  <p className="text-sm text-destructive">Erros</p>
                </div>
                
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                  <FileSpreadsheet className="h-8 w-8 text-accent-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-accent-foreground">{importResult.total}</p>
                  <p className="text-sm text-accent-foreground">Total</p>
                </div>
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Erros Encontrados
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm bg-destructive/5 border border-destructive/20 rounded p-2">
                        <p className="font-medium text-destructive">Linha {error.row}:</p>
                        <p className="text-muted-foreground">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="neo-button"
              disabled={isLoading}
            >
              {importResult ? 'Fechar' : 'Cancelar'}
            </Button>
            {!importResult && (
              <Button
                onClick={handleImport}
                className="neo-button bg-gradient-primary text-primary-foreground"
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? 'Importando...' : 'Importar Funcionários'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};