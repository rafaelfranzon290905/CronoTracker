export type Collaborador = {
  id: string;        // ID único para cada colaborador
  name: string;
  cpf: string;
  role: string;
  email: string;
  dataEntrada: string;  
  projects: string[];
};