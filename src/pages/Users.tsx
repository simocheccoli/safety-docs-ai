import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { userApi, isAdmin } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useListPagination } from "@/hooks/useListPagination";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { Download, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

export default function Users() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user" | "Admin" | "Tecnico",
    active: true,
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/");
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userApi.getAll();
      // Mappa i dati dal backend (name) al formato frontend (firstName, lastName)
      const mappedUsers = fetchedUsers.map(user => ({
        ...user,
        firstName: user.firstName || (user.name ? user.name.split(' ')[0] : ''),
        lastName: user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
        active: user.active !== false, // Default a true se non specificato
      }));
      setUsers(mappedUsers);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive",
      });
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Usa hook per paginazione e selezione
  const {
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalPages,
    paginatedItems: paginatedUsers,
    startIndex,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    getSelectedItems,
  } = useListPagination(users, 10);

  // Funzioni export
  const handleExportCSV = () => {
    exportToCSV(
      paginatedUsers,
      ['Nome', 'Cognome', 'Email', 'Ruolo', 'Stato'],
      (user) => [
        user.firstName || '',
        user.lastName || '',
        user.email || '',
        user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'Tecnico' : user.role || '',
        user.active ? 'Attivo' : 'Disattivo',
      ],
      'utenti'
    );
    toast({
      title: 'Successo',
      description: 'File CSV esportato con successo',
    });
  };

  const handleExportExcel = async () => {
    await exportToExcel(
      paginatedUsers,
      ['Nome', 'Cognome', 'Email', 'Ruolo', 'Stato'],
      (user) => [
        user.firstName || '',
        user.lastName || '',
        user.email || '',
        user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'Tecnico' : user.role || '',
        user.active ? 'Attivo' : 'Disattivo',
      ],
      'utenti'
    );
    toast({
      title: 'Successo',
      description: 'File Excel esportato con successo',
    });
  };

  const handleExportSelected = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    await exportToExcel(
      selected,
      ['Nome', 'Cognome', 'Email', 'Ruolo', 'Stato'],
      (user) => [
        user.firstName || '',
        user.lastName || '',
        user.email || '',
        user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'Tecnico' : user.role || '',
        user.active ? 'Attivo' : 'Disattivo',
      ],
      `utenti_selezionati_${selected.length}`
    );
    toast({
      title: 'Successo',
      description: `${selected.length} elementi esportati con successo`,
    });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis-1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis-2" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      // Estrai firstName e lastName da name se necessario
      const nameParts = (user.name || '').split(' ');
      setFormData({
        firstName: user.firstName || nameParts[0] || '',
        lastName: user.lastName || nameParts.slice(1).join(' ') || '',
        email: user.email,
        password: '', // Non mostrare la password esistente
        role: user.role,
        active: user.active !== false,
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    // Password obbligatoria solo per nuovi utenti
    if (!editingUser && !formData.password) {
      toast({
        title: "Errore",
        description: "La password è obbligatoria per i nuovi utenti",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Combina firstName e lastName in name per il backend
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      
      if (editingUser) {
        // Update existing user
        const updateData: { name?: string; email?: string; password?: string; role?: string } = {
          name,
          email: formData.email,
          role: formData.role,
        };
        
        // Password opzionale in fase di modifica
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await userApi.update(Number(editingUser.id), updateData);
        toast({
          title: "Utente aggiornato",
          description: "Le modifiche sono state salvate",
        });
      } else {
        // Create new user
        await userApi.create({
          name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        toast({
          title: "Utente creato",
          description: "Il nuovo utente è stato aggiunto",
        });
      }

      await loadUsers();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore nel salvataggio dell'utente",
        variant: "destructive",
      });
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string | number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      await userApi.delete(Number(userToDelete));
      
      toast({
        title: "Utente eliminato",
        description: "L'utente è stato rimosso",
      });

      await loadUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'eliminazione dell'utente",
        variant: "destructive",
      });
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    // Nota: Il backend non supporta il campo "active", usa soft-deletes
    // Per ora disabilitiamo questa funzionalità o la implementiamo come soft-delete
    // Per semplicità, commentiamo questa funzione e rimuoviamo lo switch
    toast({
      title: "Funzionalità non disponibile",
      description: "L'attivazione/disattivazione utenti non è ancora supportata",
      variant: "destructive",
    });
    
    // TODO: Implementare soft-delete/restore se necessario
    // await userApi.delete(Number(user.id)); // per disattivare
    // await userApi.restore(Number(user.id)); // per riattivare (se implementato)
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Gestione Utenti</h1>
          <p className="text-muted-foreground mt-1">Gestisci gli utenti del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Select Elementi per Pagina */}
          <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per pagina</SelectItem>
              <SelectItem value="25">25 per pagina</SelectItem>
              <SelectItem value="50">50 per pagina</SelectItem>
              <SelectItem value="100">100 per pagina</SelectItem>
            </SelectContent>
          </Select>

          {/* Dropdown Esporta */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Esporta
                {hasSelection && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedIds.size}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Esporta CSV (pagina corrente)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Esporta Excel (pagina corrente)
              </DropdownMenuItem>
              {hasSelection && (
                <DropdownMenuItem onClick={handleExportSelected}>
                  Esporta selezionati ({selectedIds.size})
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Utente
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cognome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Nessun utente trovato
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={() => toggleSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.firstName || (user.name ? user.name.split(' ')[0] : '')}</TableCell>
                <TableCell>{user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : '')}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (user.role === 'Admin' || user.role === 'admin') ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'Tecnico' : user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={user.active !== false ? "default" : "secondary"}>
                    {user.active !== false ? "Attivo" : "Disattivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
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

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Info paginazione */}
      {users.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div>
            Mostrando {startIndex + 1} - {Math.min(startIndex + perPage, users.length)} di {users.length} utenti
          </div>
          {hasSelection && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedIds.size} selezionati
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                Deseleziona tutti
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifica Utente" : "Nuovo Utente"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Modifica i dati dell'utente" : "Inserisci i dati del nuovo utente"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Ruolo</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user" | "Admin" | "Tecnico") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Tecnico</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading ? "Salvataggio..." : editingUser ? "Salva modifiche" : "Crea utente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
