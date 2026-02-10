import { ClipboardList, Mic, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import AudioRecorder from "./AudioRecorder";
import DashboardWarnings from "./DashboardWarnings";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VehicleEntryProps {
  onChecklist: () => void;
  onDescribe: (description: string) => void;
  onMap: () => void;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const VehicleEntry = ({ onChecklist, onDescribe, onMap }: VehicleEntryProps) => {
  const [showAudio, setShowAudio] = useState(false);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeUp} className="text-center space-y-3">
        <motion.div
          className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Car className="w-10 h-10 text-warning" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Emergência Veicular</h2>
        <p className="text-muted-foreground">
          Seu carro apresentou algum problema? Vamos te orientar com segurança.
        </p>
      </motion.div>

      <div className="space-y-4">
        <motion.div variants={fadeUp}>
          <Button
            onClick={onChecklist}
            className="w-full h-20 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft flex items-center gap-4 justify-start px-6 transition-transform active:scale-[0.98]"
          >
            <ClipboardList className="w-8 h-8 shrink-0" />
            <div className="text-left">
              <div>Diagnóstico Rápido</div>
              <div className="text-sm font-normal opacity-80">Perguntas simples sobre o problema</div>
            </div>
          </Button>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button
            onClick={() => setShowAudio(!showAudio)}
            className="w-full h-20 text-lg font-semibold rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft flex items-center gap-4 justify-start px-6 transition-transform active:scale-[0.98]"
          >
            <Mic className="w-8 h-8 shrink-0" />
            <div className="text-left">
              <div>Descrever Problema</div>
              <div className="text-sm font-normal opacity-80">Grave um áudio ou digite</div>
            </div>
          </Button>
        </motion.div>

        <AnimatePresence>
          {showAudio && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <AudioRecorder onTranscription={onDescribe} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={fadeUp}>
          <Button
            onClick={onMap}
            variant="outline"
            className="w-full h-20 text-lg font-semibold rounded-2xl border-2 border-success text-success hover:bg-success/10 flex items-center gap-4 justify-start px-6 transition-transform active:scale-[0.98]"
          >
            <MapPin className="w-8 h-8 shrink-0" />
            <div className="text-left">
              <div>Serviços Próximos</div>
              <div className="text-sm font-normal opacity-80">Ver oficinas, postos e guinchos no mapa</div>
            </div>
          </Button>
        </motion.div>
      </div>

      <DashboardWarnings onStartDiagnosis={(symptom) => onDescribe(symptom)} />
    </motion.div>
  );
};

export default VehicleEntry;
