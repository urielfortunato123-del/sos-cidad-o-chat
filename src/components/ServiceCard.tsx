import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: "primary" | "accent" | "success" | "warning";
  onClick: () => void;
  delay?: number;
}

const colorStyles = {
  primary: {
    icon: "bg-primary/10 text-primary",
    border: "hover:border-primary/50",
  },
  accent: {
    icon: "bg-accent/10 text-accent",
    border: "hover:border-accent/50",
  },
  success: {
    icon: "bg-success/10 text-success",
    border: "hover:border-success/50",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    border: "hover:border-warning/50",
  },
};

const ServiceCard = ({ icon: Icon, title, description, color, onClick, delay = 0 }: ServiceCardProps) => {
  return (
    <Button
      variant="service"
      onClick={onClick}
      className={`h-auto p-6 flex flex-col items-start gap-4 text-left animate-slide-up ${colorStyles[color].border}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorStyles[color].icon}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="w-full">
        <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed break-words">{description}</p>
      </div>
    </Button>
  );
};

export default ServiceCard;
