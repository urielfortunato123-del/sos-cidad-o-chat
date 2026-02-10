import { ClipboardList, Mic, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioRecorder from "./AudioRecorder";
import { useState } from "react";

interface VehicleEntryProps {
  onChecklist: () => void;
  onDescribe: (description: string) => void;
  onMap: () => void;
}

const VehicleEntry = ({ onChecklist, onDescribe, onMap }: VehicleEntryProps) => {
  const [showAudio, setShowAudio] = useState(false);

  return (
    <div className="animate-slide-up space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
          <Car className="w-10 h-10 text-warning" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Emergência Veicular</h2>
        <p className="text-muted-foreground">
          Seu carro apresentou algum problema? Vamos te orientar com segurança.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={onChecklist}
          className="w-full h-20 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft flex items-center gap-4 justify-start px-6"
        >
          <ClipboardList className="w-8 h-8 shrink-0" />
          <div className="text-left">
            <div>Diagnóstico Rápido</div>
            <div className="text-sm font-normal opacity-80">Perguntas simples sobre o problema</div>
          </div>
        </Button>

        <Button
          onClick={() => setShowAudio(!showAudio)}
          className="w-full h-20 text-lg font-semibold rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft flex items-center gap-4 justify-start px-6"
        >
          <Mic className="w-8 h-8 shrink-0" />
          <div className="text-left">
            <div>Descrever Problema</div>
            <div className="text-sm font-normal opacity-80">Grave um áudio ou digite</div>
          </div>
        </Button>

        {showAudio && (
          <div className="animate-slide-up">
            <AudioRecorder onTranscription={onDescribe} />
          </div>
        )}

        <Button
          onClick={onMap}
          variant="outline"
          className="w-full h-20 text-lg font-semibold rounded-2xl border-2 border-success text-success hover:bg-success/10 flex items-center gap-4 justify-start px-6"
        >
          <MapPin className="w-8 h-8 shrink-0" />
          <div className="text-left">
            <div>Serviços Próximos</div>
            <div className="text-sm font-normal opacity-80">Ver oficinas, postos e guinchos no mapa</div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default VehicleEntry;
