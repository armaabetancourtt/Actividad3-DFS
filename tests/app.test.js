const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Pruebas Unitarias - Sistema Audi', () => {
    let token;
    const credenciales = { usuario: "usuario1", password: "123" };

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Registro de Usuario', async () => {
        await request(app).post('/api/register').send(credenciales);
        const res = await request(app).post('/api/register').send({
            usuario: `test_${Date.now()}`,
            password: "123"
        });
        expect(res.statusCode).toBe(201);
    });

    test('Login y Generación de Token', async () => {
        const res = await request(app).post('/api/login').send(credenciales);
        expect(res.statusCode).toBe(200);
        token = res.body.token;
    });

    test('Creación de Producto', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: "Audi A4",
                img: "audi_a4.jpg",
                precio: 50000,
                stock: 10,
                categoria: "Sedán"
            });
        expect(res.statusCode).toBe(201);
    });

    test('Creación de Tarea asignada a tecnico1', async () => {
        const res = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: "Mantenimiento Preventivo",
                descripcion: "Revisión de frenos",
                categoria: "Mecánica",
                estado: "Sin Iniciar",
                creadaPor: "usuario1",
                asignadoA: "tecnico1"
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.asignadoA).toBe("tecnico1");
        expect(res.body.creadaPor).toBe("usuario1");
    });

    test('Validación de Seguridad - Sin Token', async () => {
        const res = await request(app).get('/api/productos');
        expect(res.statusCode).toBe(401);
    });
});
