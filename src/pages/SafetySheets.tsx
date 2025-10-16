import { useState } from "react";
import { Plus, Download, Eye, Trash2, Archive, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewElaborationDialog } from "@/components/NewElaborationDialog";
import { ElaborationDetailsDialog } from "@/components/ElaborationDetailsDialog";
import { Elaboration } from "@/types/elaboration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SafetySheets() {
  const [elaborations, setElaborations] = useState<Elaboration[]>([
    {
      id: 1,
      title: "Analisi Laboratorio Q1 2024",
      status: "completed",
      begin_process: "2024-01-15T10:00:00Z",
      end_process: "2024-01-15T10:45:00Z",
      created_at: "2024-01-15T09:55:00Z",
      updated_at: "2024-01-15T10:45:00Z",
      deleted_at: null,
    },
    {
      id: 2,
      title: "Schede Chimici Reparto A",
      status: "elaborating",
      begin_process: "2024-03-10T14:20:00Z",
      end_process: null,
      created_at: "2024-03-10T14:15:00Z",
      updated_at: "2024-03-10T14:20:00Z",
      deleted_at: null,
    },
    {
      id: 3,
      title: "Verifica Sostanze Pericolose",
      status: "error",
      begin_process: "2024-02-20T09:10:00Z",
      end_process: "2024-02-20T09:25:00Z",
      created_at: "2024-02-20T09:05:00Z",
      updated_at: "2024-02-20T09:25:00Z",
      deleted_at: null,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedElaboration, setSelectedElaboration] = useState<Elaboration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleNewElaboration = (name: string, files: File[]) => {
    const newElaboration: Elaboration = {
      id: Math.max(...elaborations.map(e => e.id), 0) + 1,
      title: name,
      status: "elaborating",
      begin_process: new Date().toISOString(),
      end_process: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    setElaborations([newElaboration, ...elaborations]);
    setDialogOpen(false);
  };

  const handleViewDetails = (elaboration: Elaboration) => {
    setSelectedElaboration(elaboration);
    setDetailsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setElaborations(elaborations.filter(e => e.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      elaborating: { label: "In elaborazione", className: "bg-warning text-warning-foreground" },
      completed: { label: "Completato", className: "bg-success text-success-foreground" },
      error: { label: "Errore", className: "bg-destructive text-destructive-foreground" },
    };
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredElaborations = elaborations.filter((elab) => {
    const matchesSearch = elab.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || elab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Elenco Elaborazioni
        </h1>
        <Button 
          onClick={() => setDialogOpen(true)} 
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuova Elaborazione
        </Button>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            placeholder="Cerca per titolo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="elaborating">In elaborazione</SelectItem>
            <SelectItem value="completed">Completato</SelectItem>
            <SelectItem value="error">Errore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Titolo</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Inizio Elaborazione</TableHead>
              <TableHead className="text-right font-semibold">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredElaborations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nessuna elaborazione trovata
                </TableCell>
              </TableRow>
            ) : (
              filteredElaborations.map((elaboration) => (
                <TableRow key={elaboration.id}>
                  <TableCell className="font-medium">{elaboration.title}</TableCell>
                  <TableCell>{getStatusBadge(elaboration.status)}</TableCell>
                  <TableCell>{formatDate(elaboration.begin_process)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(elaboration)}
                        title="Visualizza schede PDF"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {elaboration.status === "completed" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Scarica Excel"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Scarica ZIP schede"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(elaboration.id)}
                        title="Elimina"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NewElaborationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleNewElaboration}
      />

      <ElaborationDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        elaboration={selectedElaboration}
      />
    </div>
  );
}
