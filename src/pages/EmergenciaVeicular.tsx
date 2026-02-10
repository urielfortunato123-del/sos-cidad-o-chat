import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import VehicleEntry from "@/components/vehicle/VehicleEntry";
import VehicleDiagnosis from "@/components/vehicle/VehicleDiagnosis";
import VehicleOrientation from "@/components/vehicle/VehicleOrientation";
import VehicleMap from "@/components/vehicle/VehicleMap";
import VehicleEmergency from "@/components/vehicle/VehicleEmergency";
import { useAccessLog } from "@/hooks/useAccessLog";

export interface DiagnosisResult {
  risk: "green" | "yellow" | "red";
  canContinue: "sim" | "curta_distancia" | "nao";
  recommendation: string;
  serviceTypes: string[];
  description: string;
}

const pageVariants = {
  initial: { opacity: 0, x: 60, scale: 0.97 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -60, scale: 0.97 },
} as const;

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const EmergenciaVeicular = () => {
  useAccessLog('/emergencia-veicular');
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [userDescription, setUserDescription] = useState("");

  const handleDiagnosisComplete = (result: DiagnosisResult) => {
    setDiagnosis(result);
    if (result.risk === "red") {
      setStep(5);
    } else {
      setStep(3);
    }
  };

  const handleDescriptionSubmit = (description: string) => {
    setUserDescription(description);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="gradient-primary p-4 flex items-center gap-3 sticky top-0 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step === 1 ? navigate("/") : setStep(prev => Math.max(1, prev - 1) as any)}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-primary-foreground">Emergência Veicular</h1>
          <p className="text-xs text-primary-foreground/70">SOS Cidadão</p>
        </div>

        {/* Step indicator */}
        <div className="ml-auto flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              className={`h-1.5 rounded-full ${s === step ? "bg-primary-foreground w-6" : "bg-primary-foreground/30 w-1.5"}`}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          ))}
        </div>
      </motion.header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <VehicleEntry 
                onChecklist={() => setStep(2)}
                onDescribe={handleDescriptionSubmit}
                onMap={() => setStep(4)}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <VehicleDiagnosis 
                onComplete={handleDiagnosisComplete}
                initialDescription={userDescription}
              />
            </motion.div>
          )}
          {step === 3 && diagnosis && (
            <motion.div
              key="step-3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <VehicleOrientation 
                diagnosis={diagnosis}
                onMap={() => setStep(4)}
                onEmergency={() => setStep(5)}
              />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step-4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <VehicleMap 
                diagnosis={diagnosis}
                onBack={() => setStep(diagnosis ? 3 : 1)}
                onEmergency={() => setStep(5)}
              />
            </motion.div>
          )}
          {step === 5 && (
            <motion.div
              key="step-5"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <VehicleEmergency onBack={() => setStep(diagnosis ? 3 : 1)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Legal disclaimer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="container mx-auto px-4 pb-6 max-w-lg"
      >
        <p className="text-xs text-muted-foreground text-center mt-8 border-t border-border pt-4">
          ⚠️ As orientações são de caráter informativo e não substituem avaliação profissional. 
          Em caso de risco, acione serviços de emergência.
        </p>
      </motion.footer>
    </div>
  );
};

export default EmergenciaVeicular;
