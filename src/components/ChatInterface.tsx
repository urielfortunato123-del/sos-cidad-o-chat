import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, MapPin, Search, MessageSquare, Car, Map, CloudRain, AlertTriangle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CityContacts } from "@/utils/cityContacts";
import { useNavigate } from "react-router-dom";
import { useWeather, getWeatherInfo } from "@/hooks/useWeather";
import { getCurrentPosition } from "@/utils/geolocation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasVehicleAction?: boolean;
  hasMapAction?: boolean;
  hasMapaSeguranca?: boolean;
  hasAlertaDesastre?: boolean;
  hasPerfilMedico?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialCep: string;
  initialService?: string;
  cityInfo?: { city: string; state: string };
  cityContacts?: CityContacts | null;
  initialMessage?: string;
}

const ChatInterface = ({ isOpen, onClose, initialCep, initialService, cityInfo, cityContacts, initialMessage }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"chat" | "search">("chat");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get user coords for weather
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => setCoords({ lat: pos.latitude, lng: pos.longitude }))
      .catch(() => {});
  }, []);

  const { weather } = useWeather(coords?.lat, coords?.lng);

  const locationDisplay = cityInfo 
    ? `${cityInfo.city}/${cityInfo.state}` 
    : `CEP: ${initialCep}`;

  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const locationText = cityInfo 
        ? `${cityInfo.city}, ${cityInfo.state}` 
        : `CEP ${initialCep}`;
      
      let welcomeText = `Oi! 😊 Eu sou a Cássia Fortunato, do SOS Cidadão. Vi que você tá em ${locationText}.`;

      // Add weather context to welcome
      if (weather) {
        const info = getWeatherInfo(weather.weatherCode);
        welcomeText += ` ${info.emoji} Agora tá ${Math.round(weather.temperature)}°C por aí.`;
        if (weather.hasSevereWeather) {
          welcomeText += ` ⚠️ Atenção: ${weather.alertMessage}. Cuidado, viu!`;
        }
      }
      
      if (initialService) {
        welcomeText += ` Percebi que você precisa de ajuda com ${initialService}, né? Me conta o que tá acontecendo que eu te ajudo!`;
      } else {
        welcomeText += ` Me fala o que tá rolando — pode ser do jeitinho que quiser, tipo "tô sem luz" ou "vai chover?". Tô aqui pra te ajudar! 💙`;
      }

      const welcomeMessage: Message = {
        id: "1",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setHasSentInitialMessage(false);
    }
  }, [isOpen, initialCep, initialService, messages.length, cityInfo, weather]);

  // Auto-send OCR message after welcome
  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 1 && !hasSentInitialMessage && !isTyping) {
      setHasSentInitialMessage(true);
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      sendToAI(initialMessage);
    }
  }, [isOpen, initialMessage, messages.length, hasSentInitialMessage, isTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildWeatherContext = () => {
    if (!weather) return null;
    const info = getWeatherInfo(weather.weatherCode);
    return {
      temperature: Math.round(weather.temperature),
      apparentTemperature: Math.round(weather.apparentTemperature),
      humidity: weather.humidity,
      windSpeed: Math.round(weather.windSpeed),
      precipitation: weather.precipitation,
      weatherLabel: info.label,
      weatherEmoji: info.emoji,
      severityLevel: weather.severityLevel,
      alertMessage: weather.alertMessage,
      hourlyForecast: weather.hourlyForecast.slice(0, 6).map(h => ({
        hour: new Date(h.time).getHours(),
        precipitation: h.precipitation,
        precipitationProbability: h.precipitationProbability,
        windSpeed: Math.round(h.windSpeed),
      })),
    };
  };

  const sendToAI = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const conversationHistory = messages
        .filter(m => m.id !== "1")
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: userMessage,
          cep: initialCep,
          conversationHistory,
          cityContacts: cityContacts || null,
          weatherContext: buildWeatherContext(),
        }
      });

      if (error) throw new Error(error.message);

      let aiResponse = data?.response || "Desculpe, não consegui processar sua mensagem. Tente novamente.";
      
      const hasVehicleAction = aiResponse.includes("[VEICULO_EMERGENCIA]");
      const hasMapAction = aiResponse.includes("[MAPA_SERVICOS]");
      const hasMapaSeguranca = aiResponse.includes("[MAPA_SEGURANCA]");
      const hasAlertaDesastre = aiResponse.includes("[ALERTA_DESASTRE]");
      const hasPerfilMedico = aiResponse.includes("[PERFIL_MEDICO]");

      aiResponse = aiResponse
        .replace(/\[VEICULO_EMERGENCIA\]/g, "")
        .replace(/\[MAPA_SERVICOS\]/g, "")
        .replace(/\[MAPA_SEGURANCA\]/g, "")
        .replace(/\[ALERTA_DESASTRE\]/g, "")
        .replace(/\[PERFIL_MEDICO\]/g, "")
        .trim();

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        hasVehicleAction,
        hasMapAction,
        hasMapaSeguranca,
        hasAlertaDesastre,
        hasPerfilMedico,
      };
      
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Ops, tive um probleminha técnico 😅 Mas posso te ajudar assim:\n\n🚑 SAMU: 192\n🚒 Bombeiros: 193\n🚔 Polícia: 190\n⚡ Energia: verifique a concessionária da sua região\n💧 Água: entre em contato com o SAE local\n\nQuer tentar de novo?`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao assistente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    sendToAI(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const renderActionButtons = (message: Message) => {
    const actions = [];
    if (message.hasVehicleAction) {
      actions.push(
        <Button key="vehicle" onClick={() => { onClose(); navigate("/emergencia-veicular"); }}
          size="sm" className="rounded-xl bg-warning text-warning-foreground hover:bg-warning/90 gap-1.5 text-xs font-semibold w-full">
          <Car className="w-4 h-4" /> Diagnóstico Veicular
        </Button>
      );
    }
    if (message.hasMapAction) {
      actions.push(
        <Button key="map-services" onClick={() => { onClose(); navigate("/emergencia-veicular?step=map"); }}
          size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold w-full border-primary text-primary hover:bg-primary/10">
          <Map className="w-4 h-4" /> Ver Serviços no Mapa
        </Button>
      );
    }
    if (message.hasMapaSeguranca) {
      actions.push(
        <Button key="mapa-seg" onClick={() => { onClose(); navigate("/mapa-seguranca"); }}
          size="sm" className="rounded-xl bg-success text-success-foreground hover:bg-success/90 gap-1.5 text-xs font-semibold w-full">
          <MapPin className="w-4 h-4" /> Mapa de Segurança
        </Button>
      );
    }
    if (message.hasAlertaDesastre) {
      actions.push(
        <Button key="alerta" onClick={() => { onClose(); navigate("/alerta-desastre"); }}
          size="sm" className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5 text-xs font-semibold w-full">
          <AlertTriangle className="w-4 h-4" /> Alerta de Desastre
        </Button>
      );
    }
    if (message.hasPerfilMedico) {
      actions.push(
        <Button key="perfil" onClick={() => { onClose(); navigate("/perfil-medico"); }}
          size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs font-semibold w-full border-accent text-accent hover:bg-accent/10">
          <Heart className="w-4 h-4" /> Perfil Médico
        </Button>
      );
    }
    return actions.length > 0 ? <div className="flex flex-col gap-1.5 mt-2">{actions}</div> : null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:top-20 md:w-[420px] bg-card rounded-2xl shadow-medium border border-border flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="gradient-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              {mode === "chat" ? <Bot className="w-5 h-5 text-primary-foreground" /> : <Search className="w-5 h-5 text-primary-foreground" />}
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">
                {mode === "chat" ? "Cássia — SOS Cidadão" : "Pesquisa Google"}
              </h3>
              <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
                <MapPin className="w-3 h-3" />
                <span>{locationDisplay}</span>
                {weather && (
                  <span className="ml-1">• {getWeatherInfo(weather.weatherCode).emoji} {Math.round(weather.temperature)}°C</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"
              onClick={() => setMode(mode === "chat" ? "search" : "chat")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              title={mode === "chat" ? "Abrir pesquisa Google" : "Voltar ao chat"}>
              {mode === "chat" ? <Search className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {mode === "chat" ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-secondary text-secondary-foreground rounded-tl-md"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {renderActionButtons(message)}
                    <span className="text-xs opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress}
                  placeholder="Fala comigo... ex: vai chover?" className="flex-1 h-12 rounded-xl" disabled={isTyping} />
                <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}
                  variant="hero" size="icon-lg" className="rounded-xl">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-white">
            <iframe src="https://www.google.com/webhp?igu=1" className="w-full h-full border-0"
              title="Pesquisa Google" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
