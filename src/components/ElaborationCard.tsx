import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Elaboration } from "@/types/elaboration";

interface ElaborationCardProps {
  elaboration: Elaboration;
}

const statusConfig = {
  elaborating: {
    label: "In Elaborazione",
    variant: "default" as const,
    icon: Clock,
    color: "text-info",
  },
  completed: {
    label: "Completato",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-success",
  },
  error: {
    label: "Errore",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-destructive",
  },
};

export const ElaborationCard = ({ elaboration }: ElaborationCardProps) => {
  const config = statusConfig[elaboration.status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const calculateDuration = () => {
    if (!elaboration.end_process) return null;
    const start = new Date(elaboration.begin_process).getTime();
    const end = new Date(elaboration.end_process).getTime();
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} min`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {elaboration.title}
          </CardTitle>
          <Badge variant={config.variant} className="flex items-center gap-1">
            <StatusIcon className={`h-3 w-3 ${config.color}`} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Inizio:</span>
            <span className="font-medium">{formatDate(elaboration.begin_process)}</span>
          </div>
          {elaboration.end_process && (
            <>
              <div className="flex justify-between">
                <span>Fine:</span>
                <span className="font-medium">{formatDate(elaboration.end_process)}</span>
              </div>
              <div className="flex justify-between">
                <span>Durata:</span>
                <span className="font-medium">{calculateDuration()}</span>
              </div>
            </>
          )}
        </div>

        {elaboration.status === 'elaborating' && (
          <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
            <Clock className="h-4 w-4" />
            <span>Elaborazione in corso...</span>
          </div>
        )}

        {elaboration.status === 'completed' && (
          <Button className="w-full" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Scarica Excel
          </Button>
        )}

        {elaboration.status === 'error' && (
          <p className="text-sm text-destructive">
            Si è verificato un errore durante l'elaborazione
          </p>
        )}
      </CardContent>
    </Card>
  );
};
