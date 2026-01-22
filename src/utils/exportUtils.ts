export function exportToCSV<T>(
  items: T[],
  headers: string[],
  getRowData: (item: T) => (string | number)[],
  filename: string
) {
  if (items.length === 0) {
    return;
  }

  const rows = items.map(getRowData);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
}

export async function exportToExcel<T>(
  items: T[],
  headers: string[],
  getRowData: (item: T) => (string | number)[],
  filename: string
) {
  if (items.length === 0) {
    return;
  }

  try {
    const xlsx = await import('xlsx');
    const rows = items.map(getRowData);
    const worksheet = xlsx.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dati');
    
    // Formattare header
    const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = xlsx.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E0E0E0' } }
      };
    }

    xlsx.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch {
    // Fallback a CSV
    exportToCSV(items, headers, getRowData, filename);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
