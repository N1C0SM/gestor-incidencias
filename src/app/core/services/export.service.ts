import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { Incidencia } from '../models';
import {
  ETIQUETA_ESTADO,
  ETIQUETA_PRIORIDAD,
  formatearFecha,
  formatearFechaHora,
} from '../utils/etiquetas';

/** Marca de orden de bytes: hace que Excel abra el CSV como UTF-8. */
const BOM = '\uFEFF';

/** Cabeceras del CSV, en el mismo orden que las columnas de la tabla. */
const CABECERAS = [
  'Código',
  'Título',
  'Estado',
  'Prioridad',
  'Categoría',
  'Fecha',
  'Solicitante',
  'Descripción',
] as const;

/**
 * Exportación de informes.
 *
 * - CSV: compatible con Excel (UTF-8 con BOM y separador `;`).
 * - PDF: maquetado con jsPDF y autoTable, con cabecera, pie y numeración.
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  /** Genera y descarga un CSV con el listado recibido. */
  exportarCsv(incidencias: readonly Incidencia[], nombre = 'incidencias'): void {
    const filas = incidencias.map((incidencia) => [
      incidencia.codigo,
      incidencia.titulo,
      ETIQUETA_ESTADO[incidencia.estado],
      ETIQUETA_PRIORIDAD[incidencia.prioridad],
      incidencia.categoria,
      formatearFecha(incidencia.fecha),
      incidencia.solicitante,
      incidencia.descripcion,
    ]);

    const contenido = [CABECERAS as readonly string[], ...filas]
      .map((fila) => fila.map(escaparCelda).join(';'))
      .join('\r\n');

    descargar(
      new Blob([BOM + contenido], { type: 'text/csv;charset=utf-8;' }),
      `${nombre}-${hoy()}.csv`,
    );
  }

  /** Genera y descarga un PDF maquetado con el listado recibido. */
  exportarPdf(
    incidencias: readonly Incidencia[],
    titulo = 'Listado de incidencias',
    nombre = 'incidencias',
  ): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const anchoPagina = doc.internal.pageSize.getWidth();

    // Cabecera del informe.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(titulo, 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Gestor de Incidencias · Ciclo DAM · Módulo DI 0488', 14, 22);

    const hoyTexto = new Date();
    const fechaInforme = `${formatearFecha(hoyTexto.toISOString())} · ${String(
      hoyTexto.getHours(),
    ).padStart(2, '0')}:${String(hoyTexto.getMinutes()).padStart(2, '0')}`;
    doc.text(`Generado el ${fechaInforme}`, anchoPagina - 14, 16, { align: 'right' });
    doc.text(`${incidencias.length} incidencias`, anchoPagina - 14, 22, { align: 'right' });

    autoTable(doc, {
      startY: 28,
      head: [['Código', 'Título', 'Estado', 'Prioridad', 'Categoría', 'Fecha', 'Solicitante']],
      body: incidencias.map((incidencia) => [
        incidencia.codigo,
        incidencia.titulo,
        ETIQUETA_ESTADO[incidencia.estado],
        ETIQUETA_PRIORIDAD[incidencia.prioridad],
        incidencia.categoria,
        formatearFecha(incidencia.fecha),
        incidencia.solicitante,
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 2.6,
        textColor: [51, 65, 85],
        lineColor: [219, 227, 238],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 82 },
        2: { cellWidth: 24 },
        3: { cellWidth: 22 },
        4: { cellWidth: 28 },
        5: { cellWidth: 26 },
        6: { cellWidth: 32 },
      },
      margin: { left: 14, right: 14, top: 28 },
      didDrawPage: () => {
        const altoPagina = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Gestor de Incidencias · DI 0488', 14, altoPagina - 8);
      },
    });

    // Pie con «Página X de Y» en todas las páginas.
    const totalPaginas = doc.getNumberOfPages();
    const altoPagina = doc.internal.pageSize.getHeight();
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      doc.setPage(pagina);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Página ${pagina} de ${totalPaginas}`, anchoPagina - 14, altoPagina - 8, {
        align: 'right',
      });
    }

    doc.save(`${nombre}-${hoy()}.pdf`);
  }

  /** Resumen de una incidencia concreta en PDF (detalle). */
  exportarIncidenciaPdf(incidencia: Incidencia): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const anchoPagina = doc.internal.pageSize.getWidth();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, anchoPagina, 34, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(`Incidencia ${incidencia.codigo}`, 14, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225);
    doc.text('Gestor de Incidencias · módulo DI 0488', 14, 23);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(doc.splitTextToSize(incidencia.titulo, anchoPagina - 28), 14, 46);

    autoTable(doc, {
      startY: 58,
      theme: 'plain',
      body: [
        ['Estado', ETIQUETA_ESTADO[incidencia.estado]],
        ['Prioridad', ETIQUETA_PRIORIDAD[incidencia.prioridad]],
        ['Categoría', incidencia.categoria],
        ['Fecha de alta', formatearFechaHora(incidencia.fecha)],
        ['Última actualización', formatearFechaHora(incidencia.actualizadoEn)],
        ['Solicitante', incidencia.solicitante],
      ],
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 2.2, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold', textColor: [100, 116, 139] },
      },
      margin: { left: 14, right: 14 },
    });

    const y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Descripción', 14, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(doc.splitTextToSize(incidencia.descripcion, anchoPagina - 28), 14, y + 19);

    doc.save(`${incidencia.codigo.toLowerCase()}-${hoy()}.pdf`);
  }
}

/** Escapa una celda CSV: comillas dobles y separador seguro. */
function escaparCelda(valor: string): string {
  const texto = valor.replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return `"${texto}"`;
}

/** Fecha de hoy en formato `AAAA-MM-DD`, para el nombre del archivo. */
function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Descarga un Blob en el navegador. */
function descargar(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
