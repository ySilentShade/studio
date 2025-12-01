import { z } from 'zod';

export const propertyFormSchema = z.object({
  codigo: z.string().min(1, { message: "Código é obrigatório." }),
  valor: z.string().min(1, { message: "Valor é obrigatório." }),
  bairro: z.string().min(1, { message: "Bairro é obrigatório." }),
  cidade: z.string().min(1, { message: "Cidade é obrigatória." }),
  areaTotal: z.coerce
    .number({ invalid_type_error: "Área total inválida." })
    .positive({ message: "Área total deve ser um número positivo." })
    .or(z.literal(0))
    .or(z.string().regex(/^\d+$/).transform(Number))
    .or(z.literal('')),
  areaPrivada: z.coerce
    .number({ invalid_type_error: "Área privada inválida." })
    .positive({ message: "Área privada deve ser um número positivo." })
    .or(z.literal(0))
    .or(z.string().regex(/^\d+$/).transform(Number))
    .or(z.literal('')),
  descricaoAdicional: z.string().optional(),
  caracteristicasPrincipais: z.string().min(1, { message: "Características são obrigatórias." }),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;


export const storyFormSchema = z.object({
  inputText: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
});

export type StoryFormData = z.infer<typeof storyFormSchema>;

    