import { TestBed } from '@angular/core/testing';

import type { Incidencia } from '../models';
import { ExportService } from './export.service';

/** Incidencia de ejemplo con la que se generan los informes. */
const INCIDENCIA: Incidencia = {
  id: 1012,
  codigo: 'INC-1012',
  titulo: 'El proyector del salón de actos no responde al mando',
  descripcion: 'El mando del proyector del salón de actos no funciona durante los actos del centro.',
  estado: 'cerrada',
  prioridad: 'media',
  categoria: 'Equipamiento',
  fecha: '2026-10-20T13:25:00',
  solicitanteId: 1,
  solicitante: 'Ana Admin',
  actualizadoEn: '2026-10-21T09:15:00',
};

/** Cabeceras exactas que debe escribir el CSV. */
const CABECERAS =
  '"Código";"Título";"Estado";"Prioridad";"Categoría";"Fecha";"Solicitante";"Descripción"';

/**
 * jsdom no implementa las APIs de descarga de `Blob`, así que se dan de alta
 * como no-op para poder espiarlas con `vi.spyOn` en cada prueba.
 */
function instalarApisDeDescarga(): void {
  if (!('createObjectURL' in URL)) {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: () => 'blob:descarga',
    });
  }
  if (!('revokeObjectURL' in URL)) {
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  }
}

/** Espía la descarga: URL del Blob, revocación de la URL y clic del enlace. */
function espiarDescarga() {
  instalarApisDeDescarga();
  return {
    crearUrl: vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:descarga'),
    revocarUrl: vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined),
    clicEnlace: vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined),
  };
}

/**
 * Pruebas de la exportación de informes.
 *
 * Interesa el CSV: se comprueba el Blob generado (BOM + cabeceras + filas) y
 * que la descarga se dispara con un enlace temporal.
 */
describe('ExportService', () => {
  let exportador: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    exportador = TestBed.inject(ExportService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exportarCsv genera un Blob con BOM y cabeceras y descarga un .csv', async () => {
    const { crearUrl, revocarUrl, clicEnlace } = espiarDescarga();

    exportador.exportarCsv([INCIDENCIA], 'listado');

    expect(crearUrl).toHaveBeenCalledTimes(1);
    const blob = crearUrl.mock.calls[0]?.[0] as Blob | undefined;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('text/csv;charset=utf-8;');

    // `Blob.text()` descarta el BOM al decodificar, así que se comprueba en los
    // bytes: EF BB BF hacen que Excel abra el CSV como UTF-8.
    const bytes = new Uint8Array(await (blob as Blob).arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);

    const texto = await (blob as Blob).text();
    expect(texto).toContain(CABECERAS);
    expect(texto).toContain('"INC-1012";"El proyector del salón de actos no responde al mando"');
    expect(texto).toContain('"Cerrada";"Media";"Equipamiento";"20 oct 2026";"Ana Admin"');

    expect(clicEnlace).toHaveBeenCalledTimes(1);
    const enlace = clicEnlace.mock.contexts[0] as HTMLAnchorElement;
    expect(enlace.download).toMatch(/^listado-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(revocarUrl).toHaveBeenCalledWith('blob:descarga');
  });

  it('exportarCsv no falla con una lista vacía y descarga solo las cabeceras', async () => {
    const { crearUrl, clicEnlace } = espiarDescarga();

    expect(() => exportador.exportarCsv([])).not.toThrow();

    expect(crearUrl).toHaveBeenCalledTimes(1);
    expect(clicEnlace).toHaveBeenCalledTimes(1);

    const blob = crearUrl.mock.calls[0]?.[0] as Blob;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);

    const texto = await blob.text();
    expect(texto).toBe(CABECERAS);
  });
});
