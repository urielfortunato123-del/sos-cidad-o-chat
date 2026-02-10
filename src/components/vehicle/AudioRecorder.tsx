import { useState, useRef } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}

const AudioRecorder = ({ onTranscription }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast({
        title: "Microfone indisponível",
        description: "Permita o acesso ao microfone ou digite seu problema abaixo.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];

        const { data, error } = await supabase.functions.invoke("vehicle-audio-transcribe", {
          body: { audio: base64 },
        });

        if (error) throw error;

        if (data?.text) {
          setTextInput(data.text);
          toast({ title: "Áudio transcrito!", description: data.text });
        } else {
          toast({
            title: "Não entendi o áudio",
            description: "Tente novamente ou digite o problema.",
            variant: "destructive",
          });
        }
        setIsTranscribing(false);
      };
    } catch {
      setIsTranscribing(false);
      toast({
        title: "Erro na transcrição",
        description: "Não foi possível transcrever. Digite o problema manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitText = () => {
    if (textInput.trim()) {
      onTranscription(textInput.trim());
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-soft space-y-4">
      {/* Audio recording */}
      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`w-20 h-20 rounded-full ${
            isRecording
              ? "bg-destructive text-destructive-foreground animate-pulse-emergency"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {isTranscribing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {isTranscribing
          ? "Transcrevendo..."
          : isRecording
          ? "Gravando... toque para parar"
          : "Toque para gravar seu problema"}
      </p>

      {/* Text fallback */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Ou digite:</p>
        <Textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder='Ex: "O carro tá fazendo um barulho estranho e a luz do painel acendeu"'
          className="min-h-[80px] rounded-xl"
        />
        <Button
          onClick={handleSubmitText}
          disabled={!textInput.trim()}
          className="w-full rounded-xl bg-primary text-primary-foreground"
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar e diagnosticar
        </Button>
      </div>
    </div>
  );
};

export default AudioRecorder;
