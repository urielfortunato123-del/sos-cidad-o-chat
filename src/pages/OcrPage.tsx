import { useState, useRef, useCallback, useMemo } from "react";
import { Camera, Upload, Copy, ArrowLeft, Loader2, FileText, X, MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface PageResult {
  id: string;
  image: string;
  text: string | null;
  isLoading: boolean;
  error?: string;
}

const OcrPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const addCameraInputRef = useRef<HTMLInputElement>(null);

  const [pages, setPages] = useState<PageResult[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const allText = useMemo(() => {
    return pages
      .filter(p => p.text)
      .map((p, i) => `--- Página ${i + 1} ---\n${p.text}`)
      .join("\n\n");
  }, [pages]);

  const detectedBillType = useMemo(() => {
    if (!allText) return null;
    const lower = allText.toLowerCase();
    const waterKeywords = ["conta de água", "saneamento", "sabesp", "copasa", "cagece", "compesa", "cedae", "embasa", "sanepar", "corsan", "caern", "deso", "caema", "cosanpa", "águas de", "consumo m³", "leitura anterior", "hidrômetro"];
    const energyKeywords = ["conta de luz", "conta de energia", "energia elétrica", "enel", "cemig", "cpfl", "copel", "celesc", "celpe", "coelba", "coelce", "cosern", "ceal", "equatorial", "energisa", "light", "eletropaulo", "kwh", "consumo kwh", "bandeira tarifária", "medidor"];
    const gasKeywords = ["conta de gás", "comgás", "ceg", "gás natural", "scgás", "bahiagás", "gasmig", "m³ de gás"];

    if (waterKeywords.some(k => lower.includes(k))) return "agua";
    if (energyKeywords.some(k => lower.includes(k))) return "energia";
    if (gasKeywords.some(k => lower.includes(k))) return "gas";
    return null;
  }, [allText]);

  const billLabel = detectedBillType === "agua" ? "💧 Conta de Água" : detectedBillType === "energia" ? "⚡ Conta de Energia" : detectedBillType === "gas" ? "🔥 Conta de Gás" : null;

  const handleAskCassia = () => {
    if (!allText || !detectedBillType) return;
    const summary = allText.slice(0, 500);
    const serviceMap: Record<string, string> = { agua: "água", energia: "luz", gas: "gás" };
    const msg = encodeURIComponent(`Extraí o texto da minha conta de ${serviceMap[detectedBillType]} (${pages.length} página(s)). Pode me ajudar a entender? Aqui está o conteúdo: ${summary}`);
    navigate(`/?chat=open&service=${detectedBillType}&ocrMessage=${msg}`);
  };

  const processImage = useCallback(async (pageId: string, base64: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, isLoading: true } : p));

    try {
      const { data, error } = await supabase.functions.invoke("ocr-extract", {
        body: { imageBase64: base64 },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setPages(prev => prev.map(p =>
        p.id === pageId ? { ...p, text: data?.text || "Nenhum texto encontrado.", isLoading: false } : p
      ));
    } catch (err: any) {
      console.error("OCR error:", err);
      setPages(prev => prev.map(p =>
        p.id === pageId ? { ...p, error: err.message, isLoading: false } : p
      ));
      toast({
        title: "Erro no OCR",
        description: err.message || "Não foi possível extrair o texto.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addPage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Formato inválido", description: "Envie uma imagem.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo grande demais", description: "Máximo 10MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const pageId = Date.now().toString();
      const newPage: PageResult = { id: pageId, image: base64, text: null, isLoading: true };
      setPages(prev => {
        const updated = [...prev, newPage];
        setActivePageIndex(updated.length - 1);
        return updated;
      });
      processImage(pageId, base64);
    };
    reader.readAsDataURL(file);
  }, [processImage, toast]);

  const handleMultipleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files).slice(0, 10);
    fileArray.forEach(file => addPage(file));
  }, [addPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (pages.length === 0) {
        handleMultipleFiles(files);
      } else {
        Array.from(files).forEach(f => addPage(f));
      }
    }
    e.target.value = "";
  };

  const removePage = (index: number) => {
    setPages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (activePageIndex >= updated.length) {
        setActivePageIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleCopy = async () => {
    if (!allText) return;
    await navigator.clipboard.writeText(allText);
    toast({ title: "Copiado!", description: `Texto de ${pages.filter(p => p.text).length} página(s) copiado.` });
  };

  const handleReset = () => {
    setPages([]);
    setActivePageIndex(0);
  };

  const activePage = pages[activePageIndex];
  const hasResults = pages.some(p => p.text);
  const isAnyLoading = pages.some(p => p.isLoading);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <FileText className="w-5 h-5" />
          <h1 className="text-lg font-bold">Leitor de Texto (OCR)</h1>
          {pages.length > 0 && (
            <span className="ml-auto text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">
              {pages.length} pág.
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Upload area - shown when no pages */}
        {pages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Extrair texto de imagens</h2>
              <p className="text-sm text-muted-foreground">
                Tire fotos ou envie várias imagens para extrair o texto de todas as páginas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="h-28 flex-col gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm font-medium">Câmera</span>
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-28 flex-col gap-2 rounded-xl border-border hover:bg-accent/10"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Galeria</span>
              </Button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleInputChange}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Multi-page view */}
        {pages.length > 0 && (
          <div className="space-y-4">
            {/* Page thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pages.map((page, i) => (
                <button
                  key={page.id}
                  onClick={() => setActivePageIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                    i === activePageIndex
                      ? "border-primary shadow-md"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={page.image} alt={`Página ${i + 1}`} className="w-full h-full object-cover" />
                  {page.isLoading && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  )}
                  <span className="absolute bottom-0 left-0 right-0 bg-foreground/70 text-primary-foreground text-[10px] text-center py-0.5">
                    {i + 1}
                  </span>
                </button>
              ))}

              {/* Add more button */}
              <button
                onClick={() => addFileInputRef.current?.click()}
                className="flex-shrink-0 w-16 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px]">Mais</span>
              </button>
            </div>

            {/* Active page preview */}
            {activePage && (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={activePage.image}
                    alt={`Página ${activePageIndex + 1}`}
                    className="w-full rounded-xl border border-border shadow-sm max-h-52 object-contain bg-muted"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {pages.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full w-7 h-7"
                        onClick={() => removePage(activePageIndex)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full w-7 h-7"
                      onClick={handleReset}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-foreground/70 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    Página {activePageIndex + 1} de {pages.length}
                  </span>
                </div>

                {activePage.isLoading && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Extraindo texto da página {activePageIndex + 1}...</p>
                  </div>
                )}

                {activePage.error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                    <p className="text-sm text-destructive">Erro: {activePage.error}</p>
                  </div>
                )}

                {activePage.text && (
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm prose prose-sm max-w-none dark:prose-invert max-h-60 overflow-y-auto">
                    <ReactMarkdown>{activePage.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* Actions - shown when at least one result */}
            {hasResults && !isAnyLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Texto completo ({pages.filter(p => p.text).length} página{pages.filter(p => p.text).length > 1 ? "s" : ""})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar tudo
                  </Button>
                </div>

                {detectedBillType && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {billLabel} detectada! 🎉
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A Cássia pode te ajudar a entender sua conta e resolver problemas.
                    </p>
                    <Button
                      onClick={handleAskCassia}
                      className="w-full gap-2 rounded-xl bg-primary text-primary-foreground"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Pedir ajuda à Cássia
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => addCameraInputRef.current?.click()}
                    className="gap-2 rounded-xl"
                  >
                    <Camera className="w-4 h-4" />
                    + Foto
                  </Button>
                  <Button
                    onClick={() => addFileInputRef.current?.click()}
                    variant="outline"
                    className="gap-2 rounded-xl"
                  >
                    <Upload className="w-4 h-4" />
                    + Imagens
                  </Button>
                </div>
              </div>
            )}

            {/* Hidden inputs for adding more pages */}
            <input
              ref={addCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleInputChange}
            />
            <input
              ref={addFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default OcrPage;
