import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChangelogVersion } from "@/types/changelog";
import { markAsRead } from "@/lib/changelogApi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Plus, 
  Wrench, 
  CheckCircle, 
  AlertCircle,
  X,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: ChangelogVersion | null;
  onMarkAsRead?: () => void;
}

export function ChangelogDialog({ 
  open, 
  onOpenChange, 
  version,
  onMarkAsRead 
}: ChangelogDialogProps) {
  const queryClient = useQueryClient();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-unread'] });
      if (onMarkAsRead) {
        onMarkAsRead();
      }
      if (dontShowAgain) {
        // Salva preferenza utente in localStorage
        localStorage.setItem('changelog_auto_show', 'false');
      }
      onOpenChange(false);
      toast({ 
        title: "Versione segnata come letta",
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

  const handleMarkAsRead = () => {
    if (version) {
      markAsReadMutation.mutate(version.version);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('changelog_auto_show', 'false');
    }
    onOpenChange(false);
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

  if (!version) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Nuova Versione Disponibile
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-lg font-semibold">v{version.version}</span>
                {getTypeBadge(version.type)}
                <span className="text-sm text-muted-foreground">
                  {formatDate(version.date)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">{version.title}</h3>
          </div>

          <Separator />

          {version.categories.added.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon('added')}
                <h4 className="font-semibold text-green-700">{getCategoryLabel('added')}</h4>
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
                <h4 className="font-semibold text-blue-700">{getCategoryLabel('changed')}</h4>
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
                <h4 className="font-semibold text-orange-700">{getCategoryLabel('fixed')}</h4>
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
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              id="dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="dont-show-again" className="cursor-pointer">
              Non mostrare più automaticamente
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
            >
              <Link to="/changelog" onClick={handleClose}>
                Vedi tutte le versioni
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              onClick={handleMarkAsRead}
              disabled={markAsReadMutation.isPending}
            >
              Ho capito
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
