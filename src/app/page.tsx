
"use client";

import * as React from "react";
import { useForm, useFormContext, FormProvider } from "react-hook-form";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  propertyFormSchema,
  storyFormSchema,
  type PropertyFormData,
  type StoryFormData,
} from "@/lib/schema";
import { formatPropertyFeatures } from "@/ai/flows/format-property-features";
import { generateStoryText } from "@/ai/flows/generate-story-text";

const defaultPropertyValues: PropertyFormData = {
  codigo: "",
  valor: "",
  bairro: "",
  cidade: "",
  areaTotal: "" as unknown as number,
  areaPrivada: "" as unknown as number,
  descricaoAdicional: "",
  caracteristicasPrincipais: "",
};

const defaultStoryValues: StoryFormData = {
  inputText: "",
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

const PropertyDescriptionForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedDescription, setGeneratedDescription] = React.useState("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: defaultPropertyValues,
  });

  const formatCurrency = (valueStr: string): string => {
    let s = String(valueStr).replace(/R\$\s*/g, "").trim();
    s = s.replace(/\./g, ''); 
    s = s.replace(',', '.');

    const numberValue = parseFloat(s);
    if (isNaN(numberValue)) return valueStr;

    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numberValue);
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    setGeneratedDescription("");
    try {
      const aiResult = await formatPropertyFeatures({ featuresText: data.caracteristicasPrincipais });
      if (!aiResult || !aiResult.formattedFeatures) {
        throw new Error("A IA não conseguiu formatar as características.");
      }
      
      const formattedValor = formatCurrency(data.valor);
      const location = `${data.bairro.toUpperCase()} - ${data.cidade.toUpperCase()}/MG`;
      
      const formattedAreaTotal = new Intl.NumberFormat('pt-BR').format(data.areaTotal);
      const formattedAreaPrivada = new Intl.NumberFormat('pt-BR').format(data.areaPrivada);

      const descriptionParts = [
        location, "", `Código do imóvel: ${data.codigo}`,
      ];

      if (data.descricaoAdicional?.trim()) {
        descriptionParts.push("", data.descricaoAdicional.trim());
      }
      
      descriptionParts.push("", "CARACTERÍSTICAS PRINCIPAIS:", aiResult.formattedFeatures.trimStart(), "");
      descriptionParts.push(`Área Total: ${formattedAreaTotal} m²`);
      descriptionParts.push(`Área Privada: ${formattedAreaPrivada} m²`);
      descriptionParts.push(`💰VALOR: ${formattedValor}`, "");
      descriptionParts.push("Agende uma visita hoje mesmo com nossa equipe:");
      descriptionParts.push("📲(31) 9 9859 0590 / 3058-1600");
      descriptionParts.push("Avenida Acadêmico Nilo Figueiredo, 3273, Santos Dumont II, Lagoa Santa/MG");

      setGeneratedDescription(descriptionParts.join("\n"));
      toast({ title: "Sucesso!", description: "Descrição gerada." });
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
      toast({ title: "Copiado!", description: "Descrição copiada para a área de transferência." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao copiar", description: "Não foi possível copiar a descrição." });
    }
  };

  const confirmClearForm = () => {
    form.reset(defaultPropertyValues);
    setGeneratedDescription("");
    setIsAlertOpen(false);
    toast({ title: "Campos Limpos", description: "O formulário foi reiniciado." });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Imóvel</CardTitle>
            <CardDescription>Preencha os dados para gerar a descrição completa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="codigo" render={({ field }) => (
                <FormItem><FormLabel>Código do Imóvel</FormLabel><FormControl><Input placeholder="Ex: AP0123" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="valor" render={({ field }) => (
                <FormItem><FormLabel>Valor</FormLabel><FormControl><Input placeholder="Ex: 350.000,00" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="bairro" render={({ field }) => (
              <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Ex: Centro" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cidade" render={({ field }) => (
              <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="Ex: Belo Horizonte" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="areaTotal" render={({ field }) => (
                <FormItem><FormLabel>Área Total (m²)</FormLabel><FormControl><Input type="text" placeholder="Ex: 120" {...field} onChange={e => field.onChange(parseFloat(e.target.value.replace(/\./g, '').replace(',', '.')) || '')} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="areaPrivada" render={({ field }) => (
                <FormItem><FormLabel>Área Privada (m²)</FormLabel><FormControl><Input type="text" placeholder="Ex: 90" {...field} onChange={e => field.onChange(parseFloat(e.target.value.replace(/\./g, '').replace(',', '.')) || '')} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="descricaoAdicional" render={({ field }) => (
              <FormItem><FormLabel>Descrição Adicional (Opcional)</FormLabel><FormControl><Textarea placeholder="Detalhes extras sobre o imóvel..." className="resize-y min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="caracteristicasPrincipais" render={({ field }) => (
              <FormItem><FormLabel>Características Principais (para IA)</FormLabel><FormControl><Textarea placeholder="Ex: 3 quartos sendo 1 suíte, sala ampla, cozinha com armários, 2 vagas garagem." className="resize-y min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Gerar Descrição
            </Button>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild><Button type="button" variant="outline-destructive" className="w-full sm:w-auto"><Trash2 className="mr-2 h-4 w-4" />Limpar Campos</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle><AlertDialogDescription>Tem certeza de que deseja limpar todos os campos do formulário? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmClearForm}>Confirmar Limpeza</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader><CardTitle>Descrição Gerada</CardTitle><CardDescription>Revise e copie a descrição otimizada.</CardDescription></CardHeader>
          <CardContent className="flex-grow flex flex-col"><Textarea readOnly placeholder="A descrição gerada aparecerá aqui..." value={generatedDescription} className="flex-grow resize-none text-sm leading-relaxed" /></CardContent>
          <CardFooter>
            {generatedDescription && <Button variant="secondary" onClick={handleCopy} className="w-full"><ClipboardCopy className="mr-2 h-4 w-4" />Copiar Descrição</Button>}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

const StoryGeneratorForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedStory, setGeneratedStory] = React.useState("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: defaultStoryValues,
  });

  const onSubmit = async (data: StoryFormData) => {
    setIsLoading(true);
    setGeneratedStory("");
    try {
      const result = await generateStoryText({ rawText: data.inputText });
      if (!result || !result.storyText) {
        throw new Error("A IA não conseguiu gerar o texto para o story.");
      }
      setGeneratedStory(result.storyText);
      toast({ title: "Sucesso!", description: "Texto para Story gerado." });
    } catch (error) {
      console.error("Error generating story text:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar texto",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedStory) return;

    // Logic to split the string for clipboard
    const parts = generatedStory.split(' | ');
    let firstLine = '';
    let secondLine = '';

    for (const part of parts) {
      if ((firstLine + part + ' | ').length <= 47) {
        firstLine += (firstLine ? ' | ' : '') + part;
      } else {
        secondLine += (secondLine ? ' | ' : '') + part;
      }
    }
    
    // Trim trailing separators
    firstLine = firstLine.trim();
    secondLine = secondLine.trim();
    if(firstLine.endsWith('|')) firstLine = firstLine.slice(0, -1).trim();


    const textToCopy = secondLine ? `${firstLine}\n${secondLine}` : firstLine;

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({ title: 'Copiado!', description: 'Texto para Story copiado para a área de transferência.' });
    }).catch(() => {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar o texto.' });
    });
  };
  
  const confirmClearForm = () => {
    form.reset(defaultStoryValues);
    setGeneratedStory("");
    setIsAlertOpen(false);
    toast({ title: "Campo Limpo", description: "O campo de texto foi reiniciado." });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Gerador para Stories</CardTitle>
            <CardDescription>Cole a descrição do imóvel para gerar o texto formatado para stories.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField control={form.control} name="inputText" render={({ field }) => (
              <FormItem><FormLabel>Descrição do Imóvel</FormLabel><FormControl><Textarea placeholder="Ex: Casa com 4 quartos, 2 suítes, área gourmet, piscina e garagem para 4 carros..." className="resize-y min-h-[200px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Gerar para Stories
            </Button>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild><Button type="button" variant="outline-destructive" className="w-full sm:w-auto"><Trash2 className="mr-2 h-4 w-4" />Limpar</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle><AlertDialogDescription>Tem certeza de que deseja limpar o campo de texto?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmClearForm}>Confirmar</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader><CardTitle>Texto Formatado</CardTitle><CardDescription>Revise e copie o texto para seus stories.</CardDescription></CardHeader>
          <CardContent className="flex-grow flex flex-col"><Textarea readOnly placeholder="O texto para stories aparecerá aqui..." value={generatedStory} className="flex-grow resize-none text-sm leading-relaxed" /></CardContent>
          <CardFooter>
            {generatedStory && <Button variant="secondary" onClick={handleCopyToClipboard} className="w-full"><ClipboardCopy className="mr-2 h-4 w-4" />Copiar para Stories</Button>}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default function PropertyToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-6 px-4 md:px-8 flex items-center justify-center gap-3 border-b">
        <HouseIcon />
        <h1 className="text-2xl font-semibold text-foreground">
          Gerador de Descrições de Imóveis
        </h1>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Descrição de Imóveis</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <PropertyDescriptionForm />
          </TabsContent>
          <TabsContent value="stories" className="pt-6">
            <StoryGeneratorForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    