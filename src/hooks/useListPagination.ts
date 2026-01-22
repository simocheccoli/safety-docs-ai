import { useState, useEffect } from 'react';

export function useListPagination<T extends { id: string | number }>(
  items: T[],
  defaultPerPage = 10
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const totalPages = Math.ceil(items.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedItems = items.slice(startIndex, startIndex + perPage);

  // Reset pagina quando cambia perPage
  useEffect(() => {
    setCurrentPage(1);
  }, [perPage]);

  // Toggle selezione
  const toggleSelection = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Seleziona tutti nella pagina corrente
  const selectAll = () => {
    const ids = paginatedItems.map(item => item.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  };

  // Deseleziona tutti nella pagina corrente
  const deselectAll = () => {
    const ids = paginatedItems.map(item => item.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  };

  // Seleziona/deseleziona tutti nella pagina corrente (toggle)
  const toggleSelectAll = () => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  // Deseleziona tutti (globale)
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Verifica se tutti nella pagina sono selezionati
  const isAllSelected = paginatedItems.length > 0 && 
    paginatedItems.every(item => selectedIds.has(item.id));

  // Verifica se almeno uno nella pagina è selezionato
  const hasSelection = paginatedItems.some(item => selectedIds.has(item.id));

  // Ottieni elementi selezionati da tutti gli items (non solo pagina corrente)
  const getSelectedItems = (): T[] => {
    return items.filter(item => selectedIds.has(item.id));
  };

  return {
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    totalPages,
    paginatedItems,
    startIndex,
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
    getSelectedItems,
  };
}
