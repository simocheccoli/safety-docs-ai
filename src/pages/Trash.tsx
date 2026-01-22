import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isAdmin } from "@/lib/auth";
import { apiClient } from "@/lib/apiClient";

interface TrashItem {
  id: number;
  type: string;
  name: string;
  deleted_at: string;
  code?: string;
  company?: string;
  email?: string;
  vat_number?: string;
  dvr_id?: number;
}

export default function Trash() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }
    loadTrash();
  }, [navigate]);

  const loadTrash = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ data: TrashItem[]; summary?: any }>("/trash");
      // Backend restituisce { data: [...], summary: {...} }
      setItems(response.data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Errore nel caricamento del cestino";
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error loading trash:", err);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (item: TrashItem) => {
    const key = `${item.type}-${item.id}`;
    if (restoring.has(key)) return;

    try {
      setRestoring((prev) => new Set(prev).add(key));
      await apiClient.post(`/trash/${item.type}/${item.id}/restore`);
      setItems((prev) => prev.filter((i) => !(i.type === item.type && i.id === item.id)));
      toast({
        title: "Successo",
        description: "Elemento ripristinato con successo",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Errore nel ripristino";
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error restoring item:", err);
    } finally {
      setRestoring((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const forceDelete = async (item: TrashItem) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare definitivamente "${item.name}"? Questa operazione non può essere annullata.`
      )
    ) {
      return;
    }

    const key = `${item.type}-${item.id}`;
    if (deleting.has(key)) return;

    try {
      setDeleting((prev) => new Set(prev).add(key));
      await apiClient.delete(`/trash/${item.type}/${item.id}`);
      setItems((prev) => prev.filter((i) => !(i.type === item.type && i.id === item.id)));
      toast({
        title: "Successo",
        description: "Elemento eliminato definitivamente",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Errore nell'eliminazione";
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error deleting item:", err);
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      risk: "Rischio",
      dvr: "DVR",
      company: "Azienda",
      user: "Utente",
      deadline: "Scadenza",
      elaboration: "Elaborazione",
      dvr_file: "File DVR",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Cestino</h1>
          <p className="text-muted-foreground mt-1">Gestisci gli elementi eliminati</p>
        </div>
        <Button onClick={loadTrash} variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Aggiorna
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Errore
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {loading && items.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Caricamento...</span>
            </div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <Trash2 className="h-12 w-12 text-muted-foreground" />
              <div className="text-lg font-medium">Il cestino è vuoto</div>
              <div className="text-sm text-muted-foreground">
                Non ci sono elementi eliminati
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={`${item.type}-${item.id}`}
              className="hover:bg-accent/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="secondary">{getTypeLabel(item.type)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.code && <span>Codice: {item.code} • </span>}
                      {item.company && <span>Azienda: {item.company} • </span>}
                      {item.email && <span>Email: {item.email} • </span>}
                      {item.vat_number && <span>P.IVA: {item.vat_number} • </span>}
                      Eliminato il: {formatDate(item.deleted_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => restoreItem(item)}
                      variant="outline"
                      size="sm"
                      disabled={restoring.has(`${item.type}-${item.id}`)}
                    >
                      {restoring.has(`${item.type}-${item.id}`) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="mr-2 h-4 w-4" />
                      )}
                      Ripristina
                    </Button>
                    <Button
                      onClick={() => forceDelete(item)}
                      variant="destructive"
                      size="sm"
                      disabled={deleting.has(`${item.type}-${item.id}`)}
                    >
                      {deleting.has(`${item.type}-${item.id}`) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Elimina definitivamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
