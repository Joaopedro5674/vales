import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface VoucherData {
  ID_VALE: string;
  NOME: string;
  APELIDO: string;
  TELEFONE: string;
  CONTATO_PESSOAL: string;
  VALOR_GAS: string | number;
  STATUS: 'NOVO' | 'ATIVO' | 'FINALIZADO' | 'SUSPENSO' | 'PERDIDO';
  DATA_ALTERACAO: string;
  DATA_EMISSAO: string;
  DATA_VENCIMENTO: string;
  existe?: boolean;
}

export const API_URL = 'https://script.google.com/macros/s/AKfycbwiXXrnnrts4DrbuJfjL663NurzJreN8x4zwAx6bJFCHbqJPLUBi3eVGA81PUK0h8U61A/exec';
