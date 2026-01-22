import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getChangelog, createVersion, updateVersion, deleteVersion } from "@/lib/changelogApi";
import { ChangelogVersion, ChangelogType } from "@/types/changelog";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import { Plus, Trash2, Pencil, X, Save, AlertCircle, Wrench, CheckCircle } from "lucide-react";

export default function ChangelogAdmin() {
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role.toLowerCase() === 'admin';

  const [editingVersion, setEditingVersion] = useState<ChangelogVersion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

  // Form state
  const [formVersion, setFormVersion] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formType, setFormType] = useState<ChangelogType>("minor");
  const [formTitle, setFormTitle] = useState("");
  const [formAdded, setFormAdded] = useState<string[]>([]);
  const [formChanged, setFormChanged] = useState<string[]>([]);
  const [formFixed, setFormFixed] = useState<string[]>([]);
  const [newAddedItem, setNewAddedItem] = useState("");
  const [newChangedItem, setNewChangedItem] = useState("");
  const [newFixedItem, setNewFixedItem] = useState("");

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['changelog'],
    queryFn: getChangelog,
  });

  const createMutation = useMutation({
    mutationFn: createVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-unread'] });
      toast({ title: "Versione creata con successo" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Errore nella creazione", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ version, updates }: { version: string; updates: Partial<ChangelogVersion> }) =>
      updateVersion(version, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-unread'] });
      toast({ title: "Versione aggiornata con successo" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Errore nell'aggiornamento", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-unread'] });
      toast({ title: "Versione eliminata" });
      setDeleteDialogOpen(false);
      setVersionToDelete(null);
    },
    onError: () => {
      toast({ title: "Errore nell'eliminazione", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setEditingVersion(null);
    setIsCreating(false);
    setFormVersion("");
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormType("minor");
    setFormTitle("");
    setFormAdded([]);
    setFormChanged([]);
    setFormFixed([]);
    setNewAddedItem("");
    setNewChangedItem("");
    setNewFixedItem("");
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (version: ChangelogVersion) => {
    setEditingVersion(version);
    setIsCreating(false);
    setFormVersion(version.version);
    setFormDate(version.date);
    setFormType(version.type);
    setFormTitle(version.title);
    setFormAdded([...version.categories.added]);
    setFormChanged([...version.categories.changed]);
    setFormFixed([...version.categories.fixed]);
  };

  const handleSave = () => {
    if (!formVersion || !formDate || !formTitle) {
      toast({ 
        title: "Errore", 
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    const versionData: Omit<ChangelogVersion, 'read'> = {
      version: formVersion,
      date: formDate,
      type: formType,
      title: formTitle,
      categories: {
        added: formAdded,
        changed: formChanged,
        fixed: formFixed,
      }
    };

    if (isCreating) {
      createMutation.mutate(versionData);
    } else if (editingVersion) {
      updateMutation.mutate({
        version: editingVersion.version,
        updates: versionData,
      });
    }
  };

  const handleDelete = (version: string) => {
    setVersionToDelete(version);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (versionToDelete) {
      deleteMutation.mutate(versionToDelete);
    }
  };

  const addItem = (category: 'added' | 'changed' | 'fixed', value: string) => {
    if (!value.trim()) return;

    const setters = {
      added: setFormAdded,
      changed: setFormChanged,
      fixed: setFormFixed,
    };

    const clearers = {
      added: setNewAddedItem,
      changed: setNewChangedItem,
      fixed: setNewFixedItem,
    };

    setters[category](prev => [...prev, value.trim()]);
    clearers[category]("");
  };

  const removeItem = (category: 'added' | 'changed' | 'fixed', index: number) => {
    const setters = {
      added: setFormAdded,
      changed: setFormChanged,
      fixed: setFormFixed,
    };

    setters[category](prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: it });
    } catch {
      return dateStr;
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Accesso negato
            </p>
            <p className="text-sm text-muted-foreground">
              Solo gli amministratori possono accedere a questa pagina
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
          <h1 className="text-2xl font-semibold text-foreground">Gestione Changelog</h1>
          <p className="text-muted-foreground">
            Crea e modifica le versioni del changelog per comunicare aggiornamenti agli utenti
          </p>
        </div>
        <Button onClick={startCreate} disabled={isCreating || editingVersion !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Versione
        </Button>
      </div>

      {(isCreating || editingVersion) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isCreating ? "Crea Nuova Versione" : `Modifica Versione ${editingVersion?.version}`}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="version">Versione *</Label>
                <Input
                  id="version"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                  placeholder="es. 2.1.0"
                  disabled={!isCreating}
                />
              </div>
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as ChangelogType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="patch">Patch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="es. Nuove funzionalità e miglioramenti"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label>Aggiunto</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newAddedItem}
                    onChange={(e) => setNewAddedItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('added', newAddedItem);
                      }
                    }}
                    placeholder="Aggiungi elemento..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem('added', newAddedItem)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formAdded.map((item, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <button
                        onClick={() => removeItem('added', i)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Modificato</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newChangedItem}
                    onChange={(e) => setNewChangedItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('changed', newChangedItem);
                      }
                    }}
                    placeholder="Aggiungi elemento..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem('changed', newChangedItem)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formChanged.map((item, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <button
                        onClick={() => removeItem('changed', i)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Risolto</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newFixedItem}
                    onChange={(e) => setNewFixedItem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('fixed', newFixedItem);
                      }
                    }}
                    placeholder="Aggiungi elemento..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem('fixed', newFixedItem)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formFixed.map((item, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <button
                        onClick={() => removeItem('fixed', i)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? "Crea" : "Salva Modifiche"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
            </Card>
          ))
        ) : versions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Nessuna versione
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea la prima versione del changelog
              </p>
              <Button onClick={startCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crea Versione
              </Button>
            </CardContent>
          </Card>
        ) : (
          versions.map((version) => (
            <Card key={version.version}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>v{version.version}</CardTitle>
                      <Badge variant={version.type === 'major' ? 'destructive' : version.type === 'minor' ? 'default' : 'secondary'}>
                        {version.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(version.date)}
                      </span>
                    </div>
                    <p className="font-medium">{version.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(version)}
                      disabled={isCreating || editingVersion !== null}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(version.version)}
                      disabled={isCreating || editingVersion !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {version.categories.added.length > 0 && (
                    <div>
                      <span className="font-semibold text-green-700">Aggiunto: </span>
                      {version.categories.added.join(", ")}
                    </div>
                  )}
                  {version.categories.changed.length > 0 && (
                    <div>
                      <span className="font-semibold text-blue-700">Modificato: </span>
                      {version.categories.changed.join(", ")}
                    </div>
                  )}
                  {version.categories.fixed.length > 0 && (
                    <div>
                      <span className="font-semibold text-orange-700">Risolto: </span>
                      {version.categories.fixed.join(", ")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare versione?</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la versione {versionToDelete}? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
