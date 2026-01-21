import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Lightbulb, Copy, Check, MessageSquare } from "lucide-react";
import {
    salesArguments,
    categoryLabels,
    categoryColors,
    getAllCategories,
    searchArguments,
    type ArgumentCategory,
    type SalesArgument,
} from "@/lib/sales-arguments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SalesArgumentsPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    highlightObjection?: string; // Para destacar objeção específica
}

export function SalesArgumentsPanel({
    open,
    onOpenChange,
    highlightObjection,
}: SalesArgumentsPanelProps) {
    const [searchQuery, setSearchQuery] = useState(highlightObjection || "");
    const [selectedCategory, setSelectedCategory] = useState<ArgumentCategory | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const categories = getAllCategories();

    const filteredArguments = useMemo(() => {
        let args = searchQuery ? searchArguments(searchQuery) : salesArguments;
        if (selectedCategory) {
            args = args.filter((a) => a.category === selectedCategory);
        }
        return args;
    }, [searchQuery, selectedCategory]);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Resposta copiada!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getCategoryCount = (category: ArgumentCategory) => {
        const args = searchQuery ? searchArguments(searchQuery) : salesArguments;
        return args.filter((a) => a.category === category).length;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Argumentos de Venda
                    </DialogTitle>
                    <DialogDescription>
                        Encontre a melhor resposta para cada objeção do cliente
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por objeção ou palavra-chave..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant={selectedCategory === null ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(null)}
                        >
                            Todos ({salesArguments.length})
                        </Badge>
                        {categories.map((cat) => {
                            const count = getCategoryCount(cat);
                            return (
                                <Badge
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer transition-all",
                                        selectedCategory === cat && categoryColors[cat]
                                    )}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                >
                                    {categoryLabels[cat]} ({count})
                                </Badge>
                            );
                        })}
                    </div>

                    {/* Arguments List */}
                    <ScrollArea className="h-[450px] pr-4">
                        {filteredArguments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Nenhum argumento encontrado para "{searchQuery}"</p>
                                <p className="text-sm mt-2">Tente outros termos</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="space-y-2">
                                {filteredArguments.map((arg) => (
                                    <ArgumentItem
                                        key={arg.id}
                                        argument={arg}
                                        onCopy={(text) => handleCopy(text, arg.id)}
                                        isCopied={copiedId === arg.id}
                                    />
                                ))}
                            </Accordion>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface ArgumentItemProps {
    argument: SalesArgument;
    onCopy: (text: string) => void;
    isCopied: boolean;
}

function ArgumentItem({ argument, onCopy, isCopied }: ArgumentItemProps) {
    return (
        <AccordionItem
            value={argument.id}
            className={cn(
                "border rounded-lg px-4 transition-all",
                categoryColors[argument.category].replace("text-", "hover:border-")
            )}
        >
            <AccordionTrigger className="hover:no-underline">
                <div className="flex items-start gap-3 text-left">
                    <Badge variant="outline" className={cn("shrink-0 mt-0.5", categoryColors[argument.category])}>
                        {categoryLabels[argument.category].split(" ")[0]}
                    </Badge>
                    <span className="font-medium">{argument.objection}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
                <div className="space-y-4">
                    {/* Response */}
                    <div className="relative group">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                                {argument.response}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onCopy(argument.response)}
                        >
                            {isCopied ? (
                                <Check className="h-4 w-4 text-solo-success" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Tips */}
                    {argument.tips && argument.tips.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Lightbulb className="h-4 w-4 text-solo-warning" />
                                Dicas para o vendedor
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                                {argument.tips.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Related Questions */}
                    {argument.relatedQuestions && argument.relatedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-muted-foreground">Perguntas relacionadas:</span>
                            {argument.relatedQuestions.map((q, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                    {q}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

/**
 * Versão compacta para exibir inline (ex: na timeline)
 */
export function QuickArgumentSuggestion({ objectionText }: { objectionText: string }) {
    const matchedArgs = useMemo(() => {
        return searchArguments(objectionText).slice(0, 2);
    }, [objectionText]);

    if (matchedArgs.length === 0) return null;

    return (
        <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1">
                <Lightbulb className="h-3 w-3" />
                Sugestão de resposta
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
                {matchedArgs[0].response.slice(0, 150)}...
            </p>
        </div>
    );
}
