import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}

const AudioRecorder = ({ onTranscription }: AudioRecorderProps) => {
  const [textInput, setTextInput] = useState("");

  const handleSubmitText = () => {
    if (textInput.trim()) {
      onTranscription(textInput.trim());
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-soft space-y-3">
      <p className="text-sm font-medium text-foreground">Descreva o problema do veículo:</p>
      <Textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder='Ex: "O carro tá fazendo um barulho estranho e a luz do painel acendeu"'
        className="min-h-[100px] rounded-xl"
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
  );
};

export default AudioRecorder;
