import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FeedbackModal = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'sugestao' | 'elogio' | 'reclamacao'>('sugestao');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: 'Mensagem obrigatória',
        description: 'Por favor, escreva sua mensagem.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        type,
        message: message.trim(),
        user_agent: navigator.userAgent,
      });

      if (error) throw error;

      toast({
        title: 'Feedback enviado!',
        description: 'Obrigado pela sua contribuição.',
      });
      setMessage('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = {
    sugestao: '💡 Sugestão',
    elogio: '⭐ Elogio',
    reclamacao: '📝 Reclamação',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-20 z-50 rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 shadow-lg"
          aria-label="Enviar feedback"
        >
          <MessageSquare className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Deixe seu Feedback
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de feedback</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as typeof type)}
              className="flex gap-4"
            >
              {(['sugestao', 'elogio', 'reclamacao'] as const).map((t) => (
                <div key={t} className="flex items-center space-x-2">
                  <RadioGroupItem value={t} id={t} />
                  <Label htmlFor={t} className="cursor-pointer">
                    {typeLabels[t]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Sua mensagem</Label>
            <Textarea
              id="message"
              placeholder="Escreva aqui sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/1000
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              'Enviando...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
