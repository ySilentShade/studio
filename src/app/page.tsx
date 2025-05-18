"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2, Trash2, ClipboardCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { propertyFormSchema, type PropertyFormData } from "@/lib/schema";
import { formatPropertyFeatures } from "@/ai/flows/format-property-features";

const defaultValues: PropertyFormData = {
  codigo: "",
  valor: "",
  bairro: "",
  cidade: "",
  areaTotal: "" as unknown as number, // Zod coerce will handle empty string to 0 then validation
  areaPrivada: "" as unknown as number,
  descricaoAdicional: "",
  caracteristicasPrincipais: "",
};

// SVG House Icon Component
const HouseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="hsl(var(--accent))"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default function PropertyDescriptionPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedDescription, setGeneratedDescription] = React.useState("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  const formatCurrency = (valueStr: string): string => {
    let s = String(valueStr).replace(/R\$\s*/g, "").trim();
    // For inputs like "1.500,50" or "1500.50"
    // Assuming dot is thousand separator and comma is decimal for pt-BR
    // If there's a comma, it's likely the decimal. Dots before it are thousands.
    // If only dots, the last one might be decimal if followed by 1 or 2 digits.
    
    // Standardize: remove dots, then replace comma with dot
    s = s.replace(/\./g, ''); 
    s = s.replace(',', '.');

    const numberValue = parseFloat(s);

    if (isNaN(numberValue)) {
      return valueStr; // Return original if parsing fails
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    setGeneratedDescription("");
    try {
      const aiResult = await formatPropertyFeatures({
        featuresText: data.caracteristicasPrincipais,
      });

      if (!aiResult || !aiResult.formattedFeatures) {
        throw new Error("A IA não conseguiu formatar as características.");
      }
      
      const formattedValor = formatCurrency(data.valor);
      const location = `${data.bairro.toUpperCase()} - ${data.cidade.toUpperCase()}/MG`;

      const descriptionParts = [
        location,
        "",
        `Código do imóvel: ${data.codigo}`,
      ];

      if (data.descricaoAdicional && data.descricaoAdicional.trim() !== "") {
        descriptionParts.push("");
        descriptionParts.push(data.descricaoAdicional.trim());
      }
      
      descriptionParts.push("");
      descriptionParts.push("CARACTERÍSTICAS PRINCIPAIS:");
      descriptionParts.push(aiResult.formattedFeatures.trimStart());
      descriptionParts.push("");
      descriptionParts.push(`Área Total: ${data.areaTotal} m²`);
      descriptionParts.push(`Área Privada: ${data.areaPrivada} m²`);
      descriptionParts.push(`💰VALOR: ${formattedValor}`);
      descriptionParts.push("");
      descriptionParts.push("Agende uma visita hoje mesmo com nossa equipe:");
      descriptionParts.push("📲(31) 9 9859 0590 / 3058-1600");
      descriptionParts.push(
        "Avenida Acadêmico Nilo Figueiredo, 3273, Santos Dumont II, Lagoa Santa/MG"
      );

      setGeneratedDescription(descriptionParts.join("\n"));
      toast({
        title: "Sucesso!",
        description: "Descrição gerada.",
      });
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar descrição",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedDescription) return;
    try {
      await navigator.clipboard.writeText(generatedDescription);
      toast({
        title: "Copiado!",
        description: "Descrição copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar a descrição.",
      });
    }
  };

  const confirmClearForm = () => {
    form.reset(defaultValues);
    setGeneratedDescription("");
    setIsAlertOpen(false);
    toast({
      title: "Campos Limpos",
      description: "O formulário foi reiniciado.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-6 px-4 md:px-8 flex items-center gap-3 border-b">
        <HouseIcon />
        <h1 className="text-2xl font-semibold text-foreground">
          Descrição de Casas
        </h1>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Imóvel</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para gerar a descrição do imóvel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código do Imóvel</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: AP0123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 350.000,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Belo Horizonte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="areaTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Total (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 120" {...field} 
                           onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areaPrivada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área Privada (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 90" {...field} 
                           onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="descricaoAdicional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Adicional (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalhes extras sobre o imóvel..."
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caracteristicasPrincipais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Características Principais (para IA)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: 3 quartos sendo 1 suíte, sala ampla, cozinha com armários, 2 vagas garagem."
                          className="resize-y min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Gerar Descrição
                </Button>
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline-destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpar Campos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza de que deseja limpar todos os campos do
                        formulário? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmClearForm}>
                        Confirmar Limpeza
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Descrição Gerada</CardTitle>
                <CardDescription>
                  Revise e copie a descrição otimizada do seu imóvel.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <Textarea
                  readOnly
                  placeholder="A descrição gerada aparecerá aqui..."
                  value={generatedDescription}
                  className="flex-grow resize-none min-h-[300px] text-sm leading-relaxed"
                />
              </CardContent>
              <CardFooter>
                {generatedDescription && (
                  <Button variant="secondary" onClick={handleCopy} className="w-full">
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copiar Descrição
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  );
}
