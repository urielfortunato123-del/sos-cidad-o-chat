import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogOut, MessageSquare, BarChart3, Users, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Feedback {
  id: string;
  type: string;
  message: string;
  created_at: string;
}

interface AccessLog {
  id: string;
  page: string;
  user_agent: string;
  referrer: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  created_at: string;
}

const Admin = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão de administrador.',
          variant: 'destructive',
        });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      setIsAdmin(true);
      loadData();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, logsRes] = await Promise.all([
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (feedbackRes.data) setFeedbacks(feedbackRes.data);
      if (logsRes.data) setAccessLogs(logsRes.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sugestao':
        return 'bg-blue-500';
      case 'elogio':
        return 'bg-green-500';
      case 'reclamacao':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sugestao':
        return '💡 Sugestão';
      case 'elogio':
        return '⭐ Elogio';
      case 'reclamacao':
        return '📝 Reclamação';
      default:
        return type;
    }
  };

  // Stats
  const totalAccess = accessLogs.length;
  const todayAccess = accessLogs.filter(
    (log) => new Date(log.created_at).toDateString() === new Date().toDateString()
  ).length;
  const feedbackCounts = {
    sugestao: feedbacks.filter((f) => f.type === 'sugestao').length,
    elogio: feedbacks.filter((f) => f.type === 'elogio').length,
    reclamacao: feedbacks.filter((f) => f.type === 'reclamacao').length,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Verificando permissões...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie feedbacks e acessos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Acessos</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                {totalAccess}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Acessos Hoje</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                {todayAccess}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Feedbacks</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                {feedbacks.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Por Tipo</CardDescription>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">💡 {feedbackCounts.sugestao}</Badge>
                <Badge variant="secondary">⭐ {feedbackCounts.elogio}</Badge>
                <Badge variant="secondary">📝 {feedbackCounts.reclamacao}</Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="feedback" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedbacks
            </TabsTrigger>
            <TabsTrigger value="access">
              <BarChart3 className="h-4 w-4 mr-2" />
              Acessos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-4">
            {feedbacks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum feedback recebido ainda.
                </CardContent>
              </Card>
            ) : (
              feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getTypeColor(feedback.type)}>
                        {getTypeLabel(feedback.type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(feedback.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{feedback.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Últimos 100 Acessos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Data/Hora</th>
                        <th className="text-left py-2 px-2">Página</th>
                        <th className="text-left py-2 px-2">Origem</th>
                        <th className="text-left py-2 px-2">Dispositivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessLogs.map((log) => (
                        <tr key={log.id} className="border-b">
                          <td className="py-2 px-2">
                            {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </td>
                          <td className="py-2 px-2">{log.page}</td>
                          <td className="py-2 px-2 max-w-[200px] truncate">
                            {log.referrer || 'Direto'}
                          </td>
                          <td className="py-2 px-2 max-w-[200px] truncate text-muted-foreground">
                            {log.user_agent?.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
