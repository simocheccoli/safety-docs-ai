import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnread } from "@/lib/changelogApi";
import { ChangelogVersion } from "@/types/changelog";

/**
 * Hook per gestire le notifiche del changelog
 * Controlla se ci sono versioni non lette e gestisce l'apertura automatica del dialog
 */
export function useChangelogNotification() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [latestUnreadVersion, setLatestUnreadVersion] = useState<ChangelogVersion | null>(null);

  const { data: unreadVersions = [], isLoading } = useQuery({
    queryKey: ['changelog-unread'],
    queryFn: getUnread,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refetch ogni 5 minuti
  });

  // Controlla se mostrare automaticamente il dialog
  useEffect(() => {
    // Controlla se l'utente ha disabilitato le notifiche automatiche
    const autoShowDisabled = localStorage.getItem('changelog_auto_show') === 'false';
    
    if (autoShowDisabled || isLoading || unreadVersions.length === 0) {
      return;
    }

    // Prendi la versione più recente non letta
    const latest = unreadVersions[0];
    if (latest) {
      setLatestUnreadVersion(latest);
      setDialogOpen(true);
    }
  }, [unreadVersions, isLoading]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Reset latest version quando si chiude il dialog
    // La prossima volta che si apre, prenderà la nuova versione più recente
    setLatestUnreadVersion(null);
  };

  const handleMarkAsRead = () => {
    // Invalida la cache per aggiornare la lista delle versioni non lette
    // Questo viene gestito dal ChangelogDialog tramite mutation
  };

  return {
    unreadCount: unreadVersions.length,
    dialogOpen,
    latestUnreadVersion,
    setDialogOpen,
    handleDialogClose,
    handleMarkAsRead,
    isLoading,
  };
}
