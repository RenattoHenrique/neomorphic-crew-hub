import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button'; // shadcn-ui
import { Input } from '@/components/ui/input'; // shadcn-ui
import { Label } from '@/components/ui/label'; // shadcn-ui

interface Employee {
  id?: string;
  name: string;
  photo?: string | null; // Foto é opcional
}

interface EmployeeFormProps {
  onSubmit: (employee: Employee, file: File | null) => void;
  initialData?: Employee;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.photo || null);

  // Manipula a seleção de arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Valida se o arquivo é PNG ou JPG
      if (['image/png', 'image/jpeg'].includes(selectedFile.type)) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        alert('Por favor, selecione uma imagem em formato PNG ou JPG.');
        e.target.value = ''; // Limpa o input
      }
    }
  };

  // Manipula o envio do formulário
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O nome é obrigatório.');
      return;
    }
    onSubmit({ name, photo: preview }, file);
    setName('');
    setFile(null);
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-50 rounded-lg shadow-neumorphic">
      {/* Campo Nome */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nome do Funcionário
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500"
          placeholder="Digite o nome"
          required
        />
      </div>

      {/* Campo Upload de Foto */}
      <div>
        <Label htmlFor="photo" className="text-sm font-medium text-gray-700">
          Foto (opcional, PNG ou JPG)
        </Label>
        <Input
          id="photo"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="mt-1 w-full"
        />
      </div>

      {/* Visualização da Foto ou Ícone Padrão */}
      <div className="flex justify-center">
        <img
          src={preview || '/assets/default-avatar.png'}
          alt={preview ? 'Foto do funcionário' : 'Sem foto'}
          className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 shadow-neumorphic"
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;