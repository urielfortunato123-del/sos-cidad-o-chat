import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, Loader2, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPosition } from "@/utils/geolocation";
import { motion } from "framer-motion";
import { useAccessLog } from "@/hooks/useAccessLog";

const eventTypes = [
  { id: "alagamento", emoji: "🌊", label: "Rua Alagada" },
  { id: "deslizamento", emoji: "⛰️", label: "Deslizamento" },
  { id: "incendio", emoji: "🔥", label: "Incêndio" },
  { id: "acidente", emoji: "🚗", label: "Acidente" },
  { id: "energia", emoji: "⚡", label: "Falta de Energia" },
  { id: "ponte", emoji: "🌉", label: "Ponte Caída" },
  { id: "interdicao", emoji: "🚧", label: "Interdição" },
  { id: "queda_arvore", emoji: "🌳", label: "Queda de Árvore" },
];

const ttlOptions = [
  { value: 60, label: "1h" },
  { value: 180, label: "3h" },
  { value: 360, label: "6h" },
  { value: 720, label: "12h" },
  { value: 1440, label: "24h" },
];

const ReportarEvento = () => {
  useAccessLog("/reportar");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);
  const [description, setDescription] = useState("");
  const [ttl, setTtl] = useState(180);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getLocation = async () => {
    setGettingLocation(true);
    try {
      const pos = await getCurrentPosition();
      setCoords({ lat: pos.latitude, lng: pos.longitude });
      toast({ title: "📍 Localização obtida!" });
    } catch {
      toast({ title: "Erro de GPS", description: "Ative a localização.", variant: "destructive" });
    } finally {
      setGettingLocation(false);
    }
  };

  useEffect(() => { getLocation(); }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !coords) {
      toast({ title: "Preencha os campos", description: "Selecione o tipo e ative o GPS.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;

      // Upload photo if selected
      if (photo) {
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `events/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("reports").upload(path, photo);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("reports").getPublicUrl(path);
          photo_url = urlData.publicUrl;
        }
      }

      const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();
      
      // Insert into live_events
      const { error } = await supabase.from("live_events" as any).insert({
        event_type: selectedType,
        severity,
        description: description || eventTypes.find(t => t.id === selectedType)?.label || "",
        lat: coords.lat,
        lng: coords.lng,
        expires_at: expiresAt,
        photo_url,
      });

      if (error) {
        // Fallback to community_reports
        await supabase.from("community_reports").insert({
          type: selectedType,
          layer: "realtime",
          emoji: eventTypes.find(t => t.id === selectedType)?.emoji || "📍",
          name: eventTypes.find(t => t.id === selectedType)?.label || selectedType,
          lat: coords.lat,
          lng: coords.lng,
          severity,
          expires_at: expiresAt,
        } as any);
      }

      toast({ title: "✅ Evento reportado!", description: "Visível para todos no mapa." });
      navigate("/mapa-seguranca");
    } catch {
      toast({ title: "Erro", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-warning text-warning-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-warning-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-xl">📝</span>
          <h1 className="text-lg font-bold flex-1">Reportar Evento</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-5">
        {/* Event Type */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">Tipo de evento</h2>
          <div className="grid grid-cols-2 gap-2">
            {eventTypes.map(t => (
              <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(t.id)}
                className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                  selectedType === t.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/30"
                }`}>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{t.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">Gravidade</h2>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setSeverity(s)}
                className={`w-12 h-12 rounded-full font-bold text-base transition-all ${
                  severity === s
                    ? s <= 2 ? "bg-success text-success-foreground scale-110" : s <= 3 ? "bg-warning text-warning-foreground scale-110" : "bg-destructive text-destructive-foreground scale-110"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {severity <= 2 ? "Baixa" : severity === 3 ? "Moderada" : severity === 4 ? "Alta" : "Crítica"}
          </p>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">Descrição (opcional)</h2>
          <Input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Rua completamente alagada, nível subindo"
            className="h-12 rounded-xl" />
        </div>

        {/* TTL */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Validade
          </h2>
          <div className="flex gap-2 justify-center flex-wrap">
            {ttlOptions.map(opt => (
              <button key={opt.value} onClick={() => setTtl(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  ttl === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">📸 Foto (opcional)</h2>
          <label className="flex items-center justify-center gap-2 bg-card border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all">
            <Camera className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{photo ? photo.name : "Tirar foto ou anexar"}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="mt-2 rounded-xl max-h-40 mx-auto object-cover" />
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
          <MapPin className={`w-5 h-5 ${coords ? "text-success" : "text-muted-foreground"}`} />
          <div className="flex-1">
            {coords ? (
              <p className="text-sm text-foreground font-medium">
                📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Obtendo localização...</p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={getLocation} disabled={gettingLocation} className="rounded-lg text-xs">
            {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
          </Button>
        </div>

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={!selectedType || !coords || submitting}
          className="w-full h-14 rounded-2xl text-lg font-bold gap-3">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Reportar Evento
        </Button>
      </main>
    </div>
  );
};

export default ReportarEvento;
