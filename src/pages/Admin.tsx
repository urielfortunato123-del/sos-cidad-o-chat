import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogOut, MessageSquare, BarChart3, Users, RefreshCw, MapPin, Megaphone, Shield, Send } from 'lucide-react';
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

interface CommunityReport {
  id: string;
  lat: number;
  lng: number;
  emoji: string;
  name: string;
  type: string;
  layer: string;
  created_at: string;
}

interface BroadcastAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  active: boolean;
  created_at: string;
}

const Admin = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [alerts, setAlerts] = useState<BroadcastAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

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
      const [feedbackRes, logsRes, reportsRes, alertsRes] = await Promise.all([
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('community_reports').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('broadcast_alerts').select('*').order('created_at', { ascending: false }),
      ]);

      if (feedbackRes.data) setFeedbacks(feedbackRes.data);
      if (logsRes.data) setAccessLogs(logsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcastAlert = async () => {
    if (!alertTitle.trim() || !alertMessage.trim()) {
      toast({ title: 'Preencha título e mensagem', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('broadcast_alerts').insert({
        title: alertTitle.trim(),
        message: alertMessage.trim(),
        severity: alertSeverity,
      });
      if (error) throw error;
      toast({ title: '✅ Alerta enviado com sucesso!' });
      setAlertTitle('');
      setAlertMessage('');
      loadData();
    } catch {
      toast({ title: 'Erro ao enviar alerta', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const toggleAlert = async (id: string, active: boolean) => {
    await supabase.from('broadcast_alerts').update({ active: !active }).eq('id', id);
    loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sugestao': return 'bg-primary/80';
      case 'elogio': return 'bg-accent';
      case 'reclamacao': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sugestao': return '💡 Sugestão';
      case 'elogio': return '⭐ Elogio';
      case 'reclamacao': return '📝 Reclamação';
      default: return type;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">🔴 Crítico</Badge>;
      case 'warning': return <Badge className="bg-orange-500 text-white">🟠 Atenção</Badge>;
      case 'info': return <Badge variant="secondary">🔵 Informativo</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getLayerLabel = (layer: string) => {
    switch (layer) {
      case 'danger': return '🔴 Perigo';
      case 'realtime': return '🟡 Ao Vivo';
      default: return layer;
    }
  };

  // Stats
  const totalAccess = accessLogs.length;
  const todayAccess = accessLogs.filter(
    (log) => new Date(log.created_at).toDateString() === new Date().toDateString()
  ).length;
  const todayReports = reports.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;
  const activeAlerts = alerts.filter(a => a.active).length;

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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Painel Defesa Civil
            </h1>
            <p className="text-muted-foreground">Monitoramento de ocorrências e alertas</p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Acessos Hoje</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {todayAccess}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Acessos</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {totalAccess}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ocorrências Hoje</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-destructive" />
                {todayReports}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Ocorrências</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                {reports.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Alertas Ativos</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-orange-500" />
                {activeAlerts}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="reports">
              <MapPin className="h-4 w-4 mr-2" />
              Ocorrências
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Megaphone className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedbacks
            </TabsTrigger>
            <TabsTrigger value="access">
              <BarChart3 className="h-4 w-4 mr-2" />
              Acessos
            </TabsTrigger>
          </TabsList>

          {/* Community Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ocorrências da Comunidade ({reports.length})</CardTitle>
                <CardDescription>Últimos 200 registros reportados pelos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Data/Hora</th>
                        <th className="text-left py-2 px-2">Evento</th>
                        <th className="text-left py-2 px-2">Camada</th>
                        <th className="text-left py-2 px-2">Tipo</th>
                        <th className="text-left py-2 px-2">Coordenadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">
                            {format(new Date(r.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </td>
                          <td className="py-2 px-2 font-medium">{r.emoji} {r.name}</td>
                          <td className="py-2 px-2">{getLayerLabel(r.layer)}</td>
                          <td className="py-2 px-2">{r.type}</td>
                          <td className="py-2 px-2 text-muted-foreground">
                            <a
                              href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-primary"
                            >
                              {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reports.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">Nenhuma ocorrência registrada.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Broadcast Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Enviar Alerta Geral
                </CardTitle>
                <CardDescription>Envie um alerta que será exibido para todos os usuários do app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título do alerta (ex: Alerta de Enchente)"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Mensagem detalhada do alerta..."
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Severidade</label>
                    <Select value={alertSeverity} onValueChange={setAlertSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">🔵 Informativo</SelectItem>
                        <SelectItem value="warning">🟠 Atenção</SelectItem>
                        <SelectItem value="critical">🔴 Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={sendBroadcastAlert} disabled={sending}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    {sending ? 'Enviando...' : 'Enviar Alerta'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Alertas ({alerts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhum alerta enviado.</p>
                ) : (
                  alerts.map((a) => (
                    <div key={a.id} className={`border rounded-lg p-4 ${a.active ? '' : 'opacity-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(a.severity)}
                            {a.active ? <Badge variant="outline">Ativo</Badge> : <Badge variant="secondary">Encerrado</Badge>}
                          </div>
                          <h4 className="font-semibold">{a.title}</h4>
                          <p className="text-sm text-muted-foreground">{a.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(a.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toggleAlert(a.id, a.active)}>
                          {a.active ? 'Encerrar' : 'Reativar'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
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

          {/* Access Logs Tab */}
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
