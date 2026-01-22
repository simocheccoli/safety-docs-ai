import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getChangelog, markAsRead } from "@/lib/changelogApi";
import { ChangelogVersion } from "@/types/changelog";
import { toast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Wrench,
  CheckCircle
} from "lucide-react";

export default function Changelog() {
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['changelog'],
    queryFn: getChangelog,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-unread'] });
      toast({ 
        title: "Versione segnata come letta",
        description: "Non riceverai più notifiche per questa versione"
      });
    },
    onError: () => {
      toast({ 
        title: "Errore",
        description: "Impossibile segnare la versione come letta",
        variant: "destructive"
      });
    }
  });

  const handleMarkAsRead = (version: string) => {
    markAsReadMutation.mutate(version);
  };

  const getTypeBadge = (type: ChangelogVersion['type']) => {
    const config = {
      major: { label: 'Major', variant: 'destructive' as const, icon: AlertCircle },
      minor: { label: 'Minor', variant: 'default' as const, icon: Plus },
      patch: { label: 'Patch', variant: 'secondary' as const, icon: Wrench },
    };
    const { label, variant, icon: Icon } = config[type];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: 'added' | 'changed' | 'fixed') => {
    switch (category) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'changed':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'fixed':
        return <CheckCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getCategoryLabel = (category: 'added' | 'changed' | 'fixed') => {
    switch (category) {
      case 'added':
        return 'Aggiunto';
      case 'changed':
        return 'Modificato';
      case 'fixed':
        return 'Risolto';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: it });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Novità e Aggiornamenti</h1>
            <p className="text-muted-foreground">
              Visualizza tutte le novità e gli aggiornamenti dell'applicazione
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nessun changelog disponibile
            </p>
            <p className="text-sm text-muted-foreground">
              Non ci sono ancora versioni pubblicate
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Novità e Aggiornamenti
          </h1>
          <p className="text-muted-foreground">
            Visualizza tutte le novità e gli aggiornamenti dell'applicazione
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {versions.map((version, index) => (
          <Card key={version.version} className={version.read ? "opacity-75" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">v{version.version}</CardTitle>
                    {getTypeBadge(version.type)}
                    {!version.read && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Nuovo
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-medium text-foreground mb-1">
                    {version.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(version.date)}
                  </p>
                </div>
                {!version.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(version.version)}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Segna come letto
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {version.categories.added.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon('added')}
                    <h3 className="font-semibold text-green-700">{getCategoryLabel('added')}</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                    {version.categories.added.map((item, i) => (
                      <li key={i} className="text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {version.categories.changed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon('changed')}
                    <h3 className="font-semibold text-blue-700">{getCategoryLabel('changed')}</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                    {version.categories.changed.map((item, i) => (
                      <li key={i} className="text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {version.categories.fixed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon('fixed')}
                    <h3 className="font-semibold text-orange-700">{getCategoryLabel('fixed')}</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                    {version.categories.fixed.map((item, i) => (
                      <li key={i} className="text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {version.categories.added.length === 0 && 
               version.categories.changed.length === 0 && 
               version.categories.fixed.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Nessuna modifica documentata per questa versione
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
