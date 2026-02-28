import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, AlertTriangle, FileText, UserCircle, Construction } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tabs = [
  { path: "/", icon: Home, label: "Início", emoji: "🏠", disabled: false },
  { path: "/mapa-seguranca", icon: Map, label: "Mapa", emoji: "🗺️", disabled: false },
  { path: "/alerta-desastre", icon: AlertTriangle, label: "Alerta", emoji: "⚠️", disabled: false },
  { path: "/reportar", icon: FileText, label: "Reportar", emoji: "🚧", disabled: true },
  { path: "/perfil-medico", icon: UserCircle, label: "Perfil", emoji: "👤", disabled: false },
];

const HIDDEN_ROUTES = ["/auth", "/admin", "/install", "/qr"];

const BottomTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (HIDDEN_ROUTES.some(r => location.pathname.startsWith(r))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(tab.path);
          
          return (
            <button
              key={tab.path}
              onClick={() => {
                if (tab.disabled) {
                  toast({ title: "🚧 Em desenvolvimento", description: "Esta funcionalidade estará disponível em breve!" });
                  return;
                }
                navigate(tab.path);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[60px] relative ${
                tab.disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : isActive 
                    ? "text-primary scale-105" 
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${tab.disabled ? "text-muted-foreground/40" : isActive ? "text-primary" : ""}`} />
              <span className={`text-[10px] font-bold ${tab.disabled ? "text-muted-foreground/40" : isActive ? "text-primary" : ""}`}>
                {tab.label}
              </span>
              {tab.disabled && (
                <span className="absolute -top-1 -right-0 text-[8px] bg-warning text-warning-foreground rounded-full px-1 font-bold">
                  EM BREVE
                </span>
              )}
              {isActive && !tab.disabled && (
                <div className="w-5 h-0.5 bg-primary rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabs;
