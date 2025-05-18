import { z } from 'zod';

export const propertyFormSchema = z.object({
  codigo: z.string().min(1, { message: "Código é obrigatório." }),
  valor: z.string().min(1, { message: "Valor é obrigatório." }),
  bairro: z.string().min(1, { message: "Bairro é obrigatório." }),
  cidade: z.string().min(1, { message: "Cidade é obrigatória." }),
  areaTotal: z.coerce
    .number({ invalid_type_error: "Área total inválida." })
    .positive({ message: "Área total deve ser um número positivo." }),
  areaPrivada: z.coerce
    .number({ invalid_type_error: "Área privada inválida." })
    .positive({ message: "Área privada deve ser um número positivo." }),
  descricaoAdicional: z.string().optional(),
  caracteristicasPrincipais: z.string().min(1, { message: "Características são obrigatórias." }),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
