import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Droplets, AlertCircle, Heart, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

interface ProfileData {
  display_name: string;
  blood_type: string | null;
  allergies: string | null;
  medical_notes: string | null;
  emergency_contacts: EmergencyContact[];
}

const QrResponder = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError("Token inválido"); setLoading(false); return; }

    const fetchProfile = async () => {
      const { data, error: dbError } = await supabase
        .from("user_profiles")
        .select("display_name, blood_type, allergies, medical_notes, emergency_contacts")
        .eq("qr_token", token)
        .maybeSingle();

      if (dbError || !data) {
        setError("Perfil não encontrado");
      } else {
        setProfile({
          ...data,
          emergency_contacts: (data.emergency_contacts as unknown as EmergencyContact[]) || [],
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">{error || "Perfil não encontrado"}</h1>
          <p className="text-muted-foreground">O QR code pode estar expirado ou inválido.</p>
          <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Ir para o início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-accent text-accent-foreground p-4 shadow-lg">
        <div className="container mx-auto max-w-lg flex items-center gap-3">
          <Heart className="w-7 h-7" />
          <div>
            <h1 className="text-lg font-bold">🆘 SOS Cidadão</h1>
            <p className="text-xs opacity-80">Informações Médicas de Emergência</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-lg p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Warning */}
          <div className="bg-warning/15 border border-warning/30 rounded-2xl p-4 text-center mb-4">
            <p className="text-sm font-bold text-warning">⚠️ Use apenas em situação de emergência</p>
          </div>

          {/* Name & Blood */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-3">
            <h2 className="text-2xl font-bold text-foreground">{profile.display_name}</h2>
            {profile.blood_type && (
              <div className="flex items-center gap-3 bg-accent/10 rounded-xl p-3">
                <Droplets className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo Sanguíneo</p>
                  <p className="text-3xl font-black text-accent">{profile.blood_type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Allergies */}
          {profile.allergies && (
            <div className="bg-card rounded-2xl p-4 border border-destructive/20 shadow-soft mt-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="font-bold text-foreground">Alergias</h3>
              </div>
              <p className="text-sm text-foreground">{profile.allergies}</p>
            </div>
          )}

          {/* Medical Notes */}
          {profile.medical_notes && (
            <div className="bg-card rounded-2xl p-4 border border-border shadow-soft mt-3">
              <h3 className="font-bold text-foreground mb-1">📋 Informações Médicas</h3>
              <p className="text-sm text-foreground whitespace-pre-line">{profile.medical_notes}</p>
            </div>
          )}

          {/* Emergency Contacts */}
          {profile.emergency_contacts.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-bold text-foreground text-lg">📞 Contatos de Emergência</h3>
              {profile.emergency_contacts.map((c, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 border border-border shadow-soft flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    {c.relationship && <p className="text-xs text-muted-foreground">{c.relationship}</p>}
                    <p className="text-sm text-muted-foreground">{c.phone}</p>
                  </div>
                  <Button onClick={() => window.location.href = `tel:${c.phone}`}
                    className="bg-success hover:bg-success/90 text-success-foreground rounded-xl gap-1.5 h-11 px-4">
                    <Phone className="w-4 h-4" /> Ligar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Quick emergency numbers */}
          <div className="mt-6 space-y-2">
            <h3 className="font-bold text-foreground">🚨 Emergência Nacional</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "192", l: "SAMU", e: "🚑" },
                { n: "193", l: "Bombeiros", e: "🚒" },
                { n: "190", l: "Polícia", e: "🚓" },
              ].map(s => (
                <Button key={s.n} onClick={() => window.location.href = `tel:${s.n}`}
                  variant="outline" className="h-16 flex-col gap-1 rounded-xl font-bold">
                  <span className="text-xl">{s.e}</span>
                  <span className="text-lg">{s.n}</span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default QrResponder;
