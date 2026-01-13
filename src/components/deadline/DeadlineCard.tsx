import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Deadline, INTERVAL_LABELS } from "@/types/deadline";
import { Building2, Calendar, Clock, MoreVertical, Pencil, Trash2, CheckCircle2, AlertTriangle, Shield } from "lucide-react";

interface DeadlineCardProps {
  deadline: Deadline;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
}

export function DeadlineCard({ deadline, onEdit, onDelete, onComplete }: DeadlineCardProps) {
  const isOverdue = deadline.status === 'overdue';
  const isOnRequest = deadline.next_visit_interval === 'on_request';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return format(new Date(dateStr), "d MMM yyyy", { locale: it });
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{deadline.title}</h3>
              {isOverdue && (
                <Badge variant="destructive" className="shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Scaduto
                </Badge>
              )}
            </div>

            {deadline.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {deadline.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {deadline.company_name || `Azienda #${deadline.company_id}`}
              </span>
              
              {deadline.risk_name && (
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  {deadline.risk_name}
                </span>
              )}
              
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {INTERVAL_LABELS[deadline.next_visit_interval]}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
              {deadline.last_visit_date && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Ultima: {formatDate(deadline.last_visit_date)}
                </span>
              )}
              
              {deadline.next_visit_date && (
                <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  Prossima: {formatDate(deadline.next_visit_date)}
                </span>
              )}
              
              {isOnRequest && !deadline.next_visit_date && (
                <Badge variant="secondary" className="text-xs">
                  Su richiesta cliente
                </Badge>
              )}
            </div>

            {deadline.note && (
              <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-muted pl-2">
                {deadline.note}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onComplete(deadline.id)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Segna completato
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(deadline)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(deadline.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
