import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Save, QrCode, User, Droplets, AlertCircle, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAccessLog } from "@/hooks/useAccessLog";
import { QRCodeSVG } from "qrcode.react";

interface MedicalProfile {
  name: string;
  bloodType: string;
  allergies: string;
  medications: string;
  conditions: string;
  emergencyContact: string;
  emergencyPhone: string;
}

const STORAGE_KEY = "sos-cidadao-medical-profile";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PerfilMedico = () => {
  useAccessLog('/perfil-medico');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [profile, setProfile] = useState<MedicalProfile>({
    name: "",
    bloodType: "",
    allergies: "",
    medications: "",
    conditions: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    toast({ title: "✅ Perfil salvo!", description: "Seus dados médicos foram salvos com segurança no dispositivo." });
  };

  const handleChange = (field: keyof MedicalProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const qrData = JSON.stringify({
    sos: "SOS Cidadão - Perfil Médico",
    nome: profile.name,
    sangue: profile.bloodType,
    alergias: profile.allergies,
    medicamentos: profile.medications,
    condicoes: profile.conditions,
    contato: `${profile.emergencyContact} - ${profile.emergencyPhone}`,
  });

  const hasData = profile.name || profile.bloodType || profile.emergencyPhone;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-accent text-accent-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-accent-foreground hover:bg-accent-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Heart className="w-6 h-6" />
          <h1 className="text-lg font-bold flex-1">Perfil Médico</h1>
          {hasData && (
            <Button variant="ghost" size="icon" onClick={() => setShowQR(!showQR)} className="text-accent-foreground hover:bg-accent-foreground/10">
              <QrCode className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {showQR ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <h2 className="text-2xl font-bold text-foreground">QR Code para Socorristas</h2>
            <p className="text-muted-foreground">Mostre este código para profissionais de saúde em caso de emergência</p>
            
            <div className="bg-card rounded-3xl p-8 shadow-medium border border-border inline-block mx-auto">
              <QRCodeSVG value={qrData} size={250} level="M" />
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border text-left space-y-2">
              {profile.name && <p><strong>Nome:</strong> {profile.name}</p>}
              {profile.bloodType && (
                <p className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-accent" />
                  <strong>Sangue:</strong> <span className="text-accent font-bold text-lg">{profile.bloodType}</span>
                </p>
              )}
              {profile.allergies && <p><strong>Alergias:</strong> {profile.allergies}</p>}
              {profile.medications && <p><strong>Medicamentos:</strong> {profile.medications}</p>}
              {profile.conditions && <p><strong>Condições:</strong> {profile.conditions}</p>}
              {profile.emergencyContact && <p><strong>Contato:</strong> {profile.emergencyContact} — {profile.emergencyPhone}</p>}
            </div>

            <Button onClick={() => setShowQR(false)} variant="outline" className="w-full h-12 rounded-xl">
              ← Voltar ao formulário
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-1">Seus Dados Médicos</h2>
              <p className="text-sm text-muted-foreground">Salvo apenas no seu dispositivo — 100% privado</p>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Nome completo
              </label>
              <Input value={profile.name} onChange={e => handleChange("name", e.target.value)} placeholder="Seu nome" className="h-12 rounded-xl" />
            </div>

            {/* Blood Type */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Droplets className="w-4 h-4 text-accent" /> Tipo sanguíneo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodTypes.map(bt => (
                  <button
                    key={bt}
                    onClick={() => handleChange("bloodType", bt)}
                    className={`py-3 rounded-xl font-bold text-lg border-2 transition-all ${
                      profile.bloodType === bt
                        ? "bg-accent text-accent-foreground border-accent shadow-md scale-105"
                        : "bg-card text-foreground border-border hover:border-accent/50"
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" /> Alergias
              </label>
              <Input value={profile.allergies} onChange={e => handleChange("allergies", e.target.value)} placeholder="Ex: Penicilina, Dipirona, Camarão" className="h-12 rounded-xl" />
            </div>

            {/* Medications */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">💊 Medicamentos em uso</label>
              <Input value={profile.medications} onChange={e => handleChange("medications", e.target.value)} placeholder="Ex: Insulina, Losartana" className="h-12 rounded-xl" />
            </div>

            {/* Conditions */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">🩺 Condições / Doenças</label>
              <Input value={profile.conditions} onChange={e => handleChange("conditions", e.target.value)} placeholder="Ex: Diabetes, Hipertensão, Epilepsia" className="h-12 rounded-xl" />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-success" /> Contato de emergência
              </label>
              <Input value={profile.emergencyContact} onChange={e => handleChange("emergencyContact", e.target.value)} placeholder="Nome do contato" className="h-12 rounded-xl" />
              <Input value={profile.emergencyPhone} onChange={e => handleChange("emergencyPhone", e.target.value)} placeholder="Telefone" type="tel" className="h-12 rounded-xl" />
            </div>

            {/* Save */}
            <Button onClick={handleSave} className="w-full h-14 rounded-2xl text-lg font-bold gap-3 bg-success hover:bg-success/90 text-success-foreground">
              <Save className="w-5 h-5" />
              Salvar Perfil
            </Button>

            {hasData && (
              <Button onClick={() => setShowQR(true)} variant="outline" className="w-full h-12 rounded-xl gap-2">
                <QrCode className="w-5 h-5" />
                Ver QR Code para Socorristas
              </Button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PerfilMedico;
