import { TestBed } from '@angular/core/testing';

import { NosqlService } from './nosql.service';
import { SqlService } from './sql.service';

/**
 * Pruebas del servicio SQL simulado.
 *
 * El `TestBed` se reinicia antes de cada prueba, de modo que cada una trabaja
 * con una instancia impoluta y con los datos del seed (12 incidencias y 3
 * usuarios). Los servicios simulan un pequeño retardo: las pruebas esperan las
 * promesas con `await`.
 */
describe('SqlService', () => {
  let sql: SqlService;
  let nosql: NosqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sql = TestBed.inject(SqlService);
    nosql = TestBed.inject(NosqlService);
  });

  it('login acepta las credenciales correctas y devuelve null con la contraseña equivocada', async () => {
    await expect(sql.login('admin@centro.es', 'Admin123')).resolves.toMatchObject({
      nombre: 'Ana Admin',
      rol: 'admin',
    });

    await expect(sql.login('admin@centro.es', 'ClaveIncorrecta')).resolves.toBeNull();
  });

  it('emailExists distingue un correo ya registrado de uno libre', async () => {
    await expect(sql.emailExists('usuario@centro.es')).resolves.toBe(true);
    await expect(sql.emailExists('nuevo@centro.es')).resolves.toBe(false);
  });

  it('crearIncidencia usa el código INC- siguiente y publica la actividad, y getEstadisticas cuenta 12/5/3/4', async () => {
    // Se consultan las estadísticas antes de crear nada: la foto inicial del seed.
    await expect(sql.getEstadisticas()).resolves.toEqual({
      total: 12,
      abiertas: 5,
      enProceso: 3,
      cerradas: 4,
      usuarios: 3,
    });

    const creada = await sql.crearIncidencia({
      titulo: 'El proyector del aula 7 no enciende',
      descripcion: 'El proyector del aula 7 no responde al mando desde primera hora de la mañana.',
      prioridad: 'alta',
      categoria: 'Equipamiento',
      solicitanteId: 3,
    });

    expect(creada.codigo).toBe('INC-1013');
    expect(creada.estado).toBe('abierta');
    expect(creada.solicitante).toBe('Luis Usuario');

    // El feed NoSQL (más reciente primero) recibe el documento de creación.
    const feed = nosql.instantanea;
    expect(feed).toHaveLength(4);
    expect(feed[0]).toMatchObject({
      texto: 'Luis Usuario creó la incidencia INC-1013.',
      tipo: 'creacion',
      incidenciaCodigo: 'INC-1013',
    });
  });
});
