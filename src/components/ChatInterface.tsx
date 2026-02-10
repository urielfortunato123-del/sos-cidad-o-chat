import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, MapPin, Search, MessageSquare, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CityContacts } from "@/utils/cityContacts";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasVehicleAction?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialCep: string;
  initialService?: string;
  cityInfo?: { city: string; state: string };
  cityContacts?: CityContacts | null;
}

const ChatInterface = ({ isOpen, onClose, initialCep, initialService, cityInfo, cityContacts }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"chat" | "search">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const locationDisplay = cityInfo 
    ? `${cityInfo.city}/${cityInfo.state}` 
    : `CEP: ${initialCep}`;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const locationText = cityInfo 
        ? `${cityInfo.city}, ${cityInfo.state}` 
        : `CEP ${initialCep}`;
      
      let welcomeText = `Oi! 😊 Eu sou a Cássia Fortunato, do SOS Cidadão. Vi que você tá em ${locationText}.`;
      
      if (initialService) {
        welcomeText += ` Percebi que você precisa de ajuda com ${initialService}, né? Me conta o que tá acontecendo que eu te ajudo!`;
      } else {
        welcomeText += ` Me fala o que tá rolando — pode ser do jeitinho que quiser, tipo "tô sem luz" ou "preciso de ajuda". Tô aqui pra te ajudar! 💙`;
      }

      const welcomeMessage: Message = {
        id: "1",
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, initialCep, initialService, messages.length, cityInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToAI = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      // Prepare conversation history (excluding welcome message)
      const conversationHistory = messages
        .filter(m => m.id !== "1")
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: userMessage,
          cep: initialCep,
          conversationHistory,
          cityContacts: cityContacts || null
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      let aiResponse = data?.response || "Desculpe, não consegui processar sua mensagem. Tente novamente.";
      
      const hasVehicleAction = aiResponse.includes("[VEICULO_EMERGENCIA]");
      aiResponse = aiResponse.replace(/\[VEICULO_EMERGENCIA\]/g, "").trim();

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        hasVehicleAction,
      };
      
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error('Error calling AI:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Ops, tive um probleminha técnico 😅 Mas posso te ajudar assim:\n\n🚑 SAMU: 192\n🚒 Bombeiros: 193\n🚔 Polícia: 190\n⚡ Energia: verifique a concessionária da sua região\n💧 Água: entre em contato com o SAE local\n\nQuer tentar de novo?`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
      
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao assistente. Mostrando contatos de emergência.",
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

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-4 md:inset-auto md:right-4 md:bottom-4 md:top-20 md:w-[420px] bg-card rounded-2xl shadow-medium border border-border flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="gradient-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              {mode === "chat" ? (
                <Bot className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Search className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">
                {mode === "chat" ? "Cássia — SOS Cidadão" : "Pesquisa Google"}
              </h3>
              <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
                <MapPin className="w-3 h-3" />
                <span>{locationDisplay}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMode(mode === "chat" ? "search" : "chat")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              title={mode === "chat" ? "Abrir pesquisa Google" : "Voltar ao chat"}
            >
              {mode === "chat" ? (
                <Search className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
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
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-secondary text-secondary-foreground rounded-tl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.hasVehicleAction && (
                      <Button
                        onClick={() => {
                          onClose();
                          navigate("/emergencia-veicular");
                        }}
                        size="sm"
                        className="mt-2 rounded-xl bg-warning text-warning-foreground hover:bg-warning/90 gap-1.5 text-xs font-semibold w-full"
                      >
                        <Car className="w-4 h-4" />
                        Abrir Emergência Veicular
                      </Button>
                    )}
                    <span className="text-xs opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Fala comigo... ex: tô sem água"
                  className="flex-1 h-12 rounded-xl"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  variant="hero"
                  size="icon-lg"
                  className="rounded-xl"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Google Search iframe */
          <div className="flex-1 bg-white">
            <iframe
              src="https://www.google.com/webhp?igu=1"
              className="w-full h-full border-0"
              title="Pesquisa Google"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
