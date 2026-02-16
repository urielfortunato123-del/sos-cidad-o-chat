import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Copy, ArrowLeft, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const OcrPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processImage = useCallback(async (base64: string) => {
    setIsLoading(true);
    setExtractedText(null);

    try {
      const { data, error } = await supabase.functions.invoke("ocr-extract", {
        body: { imageBase64: base64 },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setExtractedText(data?.text || "Nenhum texto encontrado.");
    } catch (err: any) {
      console.error("OCR error:", err);
      toast({
        title: "Erro no OCR",
        description: err.message || "Não foi possível extrair o texto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleFile = useCallback((file: File) => {
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
      setImagePreview(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  }, [processImage, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    await navigator.clipboard.writeText(extractedText);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
  };

  const handleReset = () => {
    setImagePreview(null);
    setExtractedText(null);
  };

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
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Upload area */}
        {!imagePreview && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Extrair texto de imagem</h2>
              <p className="text-sm text-muted-foreground">
                Tire uma foto ou envie uma imagem para extrair o texto automaticamente
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
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {/* Image preview + results */}
        {imagePreview && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Imagem enviada"
                className="w-full rounded-xl border border-border shadow-sm max-h-64 object-contain bg-muted"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full w-8 h-8"
                onClick={handleReset}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Extraindo texto da imagem...</p>
              </div>
            )}

            {extractedText && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Texto extraído</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </Button>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{extractedText}</ReactMarkdown>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    className="gap-2 rounded-xl"
                  >
                    <Camera className="w-4 h-4" />
                    Nova foto
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="gap-2 rounded-xl"
                  >
                    <Upload className="w-4 h-4" />
                    Nova imagem
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
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OcrPage;
