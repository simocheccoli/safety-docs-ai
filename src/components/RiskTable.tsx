import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, TestTube } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { RiskType } from "@/types/risk";
import { deleteRiskType } from "@/lib/riskStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface RiskTableProps {
  risks: RiskType[];
  onRefresh: () => void;
}

const statusConfig = {
  draft: { label: "Bozza", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  validated: { label: "Validato", className: "bg-green-100 text-green-800 border-green-300" },
  active: { label: "Attivo", className: "bg-blue-100 text-blue-800 border-blue-300" },
};

export function RiskTable({ risks, onRefresh }: RiskTableProps) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      deleteRiskType(deleteId);
      window.dispatchEvent(new Event('riskTypesUpdated'));
      setDeleteId(null);
      onRefresh();
      toast({
        title: "Rischio eliminato",
        description: "Il rischio è stato eliminato con successo.",
      });
    }
  };

  if (risks.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Nessun rischio configurato</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Rischio</TableHead>
              <TableHead>Descrizione</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Ultima Modifica</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((risk) => (
              <TableRow key={risk.id}>
                <TableCell className="font-medium">{risk.name}</TableCell>
                <TableCell className="max-w-md truncate">{risk.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusConfig[risk.status].className}>
                    {statusConfig[risk.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(risk.updatedAt), "dd/MM/yyyy HH:mm", { locale: it })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/rischi/${risk.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/rischi/${risk.id}?tab=test`)}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(risk.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo rischio? L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
