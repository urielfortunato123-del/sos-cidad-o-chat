import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialCep: string;
  initialService?: string;
}

const serviceMessages: Record<string, string> = {
  energia: "Entendo que você está enfrentando problemas com a energia elétrica. Vou verificar as informações da sua região.",
  samu: "Esta é uma linha de emergência médica. Se você está em uma situação de risco de vida, ligue imediatamente para 192.",
  policia: "Para emergências policiais, ligue 190. Posso ajudá-lo a registrar uma ocorrência não emergencial.",
  bombeiros: "Para emergências com incêndio ou resgate, ligue 193. Como posso ajudá-lo?",
  prefeitura: "Vou conectá-lo aos serviços da prefeitura da sua cidade. Qual serviço você precisa?",
  outros: "Posso ajudá-lo com diversos serviços essenciais. O que você está precisando?",
};

const ChatInterface = ({ isOpen, onClose, initialCep, initialService }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "1",
        role: "assistant",
        content: `Olá! Sou o assistente do SOS Cidadão. Identifiquei sua localização pelo CEP ${initialCep}. ${
          initialService ? serviceMessages[initialService] : "Como posso ajudá-lo hoje?"
        }`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, initialCep, initialService, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("energia") || lowerMessage.includes("luz") || lowerMessage.includes("apagou")) {
        response = `Com base no CEP ${initialCep}, a distribuidora de energia da sua região é a CPFL. Para relatar falta de energia, você pode:\n\n📞 Ligar: 0800 010 0010\n📱 WhatsApp: (19) 99768-0010\n💻 Site: www.cpfl.com.br\n\nDeseja que eu forneça mais informações sobre previsão de restabelecimento?`;
      } else if (lowerMessage.includes("samu") || lowerMessage.includes("ambulância") || lowerMessage.includes("emergência médica")) {
        response = "⚠️ EMERGÊNCIA MÉDICA\n\n📞 Ligue agora: 192 (SAMU)\n\nEnquanto aguarda:\n• Mantenha a calma\n• Não mova a vítima desnecessariamente\n• Descreva claramente a situação ao atendente\n\nPosso ajudar com mais alguma informação?";
      } else if (lowerMessage.includes("tempo") || lowerMessage.includes("quando") || lowerMessage.includes("previsão")) {
        response = `Consultando informações para o CEP ${initialCep}...\n\nNo momento, não há ocorrências registradas de queda de energia na sua região. Se você está sem luz, recomendo entrar em contato com a CPFL pelo 0800 010 0010 para verificar se há manutenção programada.`;
      } else if (lowerMessage.includes("prefeitura") || lowerMessage.includes("cidade")) {
        response = `Para serviços da prefeitura no CEP ${initialCep}, você pode:\n\n🏛️ Atendimento ao Cidadão: 156\n📧 Ouvidoria Municipal\n🌐 Portal de Serviços Online\n\nQual serviço específico você precisa? (iluminação pública, obras, limpeza urbana, etc.)`;
      } else {
        response = `Entendi sua solicitação. Para melhor atendê-lo no CEP ${initialCep}, preciso de mais detalhes:\n\n• Qual serviço você está buscando?\n• É uma emergência?\n• Há quanto tempo está enfrentando esse problema?\n\nEstou aqui para ajudar!`;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    simulateResponse(inputValue);
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
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-foreground">Assistente SOS</h3>
              <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
                <MapPin className="w-3 h-3" />
                <span>CEP: {initialCep}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

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
              placeholder="Digite sua mensagem..."
              className="flex-1 h-12 rounded-xl"
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
      </div>
    </div>
  );
};

export default ChatInterface;
