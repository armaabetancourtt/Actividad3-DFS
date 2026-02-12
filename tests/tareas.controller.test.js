const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const app = require('../server');
const Usuario = require('../models/Usuario');
const Tarea = require('../models/Tarea');

let mongoServer;
let token;
let tareaId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const hashedPassword = await bcrypt.hash('1234', 10);

    await Usuario.create({
        usuario: 'tester',
        nombre: 'tester', 
        password: hashedPassword 
    });

    const res = await request(app)
        .post('/api/login')
        .send({ usuario: 'tester', password: '1234' });

    token = res.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('CRUD de tareas Audi', () => {

    it('debe crear una tarea correctamente', async () => {
        const res = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: 'Revisión técnica A3',
                descripcion: 'Control de niveles y frenos',
                categoria: 'Mantenimiento',
                estado: 'Sin Iniciar',
                creadaPor: 'tester',
                asignadoA: 'tester',
                fechaLimiteISO: '2026-05-20',
                fechaLimiteTexto: '20-MAY-2026'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id'); 
        tareaId = res.body.id;
    });

    it('debe obtener todas las tareas del usuario o asignadas', async () => {
        const res = await request(app)
            .get('/api/tareas')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('debe actualizar el estado de una tarea', async () => {
        const res = await request(app)
            .put(`/api/tareas/${tareaId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                estado: 'Finalizado',
                titulo: 'Revisión técnica A3 (Actualizado)' 
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.estado).toBe('Finalizado');
    });

    it('debe denegar acceso si no hay token', async () => {
        const res = await request(app)
            .get('/api/tareas');
        
        expect(res.statusCode).toBe(401);
    });

    it('debe eliminar una tarea existente', async () => {
        const res = await request(app)
            .delete(`/api/tareas/${tareaId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        
        const tareaEnDb = await Tarea.findById(tareaId);
        expect(tareaEnDb).toBeNull();
    });

});