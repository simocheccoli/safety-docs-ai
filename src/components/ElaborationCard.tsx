import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Elaboration } from "@/types/elaboration";
import { Progress } from "@/components/ui/progress";

interface ElaborationCardProps {
  elaboration: Elaboration;
}

const statusConfig = {
  processing: {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{elaboration.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {elaboration.filesCount} {elaboration.filesCount === 1 ? 'scheda' : 'schede'}
            </CardDescription>
          </div>
          <Badge variant={config.variant} className="flex items-center gap-1">
            <StatusIcon className={`h-3 w-3 ${config.color}`} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {elaboration.status === 'processing' && elaboration.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>{elaboration.progress}%</span>
              </div>
              <Progress value={elaboration.progress} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Creato: {elaboration.createdAt.toLocaleDateString('it-IT')}
            </span>
            {elaboration.completedAt && (
              <span className="text-muted-foreground">
                Completato: {elaboration.completedAt.toLocaleDateString('it-IT')}
              </span>
            )}
          </div>

          {elaboration.status === 'completed' && elaboration.excelUrl && (
            <Button className="w-full" variant="default">
              <Download className="mr-2 h-4 w-4" />
              Scarica Excel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
