
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Pruebas Unitarias - Audi API', () => {
    let token;
    let usuarioTest = `user_${Date.now()}`;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Registro de usuario exitoso', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({ usuario: usuario1, password: '123' });
        expect(res.statusCode).toEqual(201);
    });

    test('Login y obtención de Token JWT', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ usuario: usuario1, password: '123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    test('Creación de producto (Ruta protegida)', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Producto Test',
                img: 'test.jpg',
                precio: 100,
                stock: 10,
                categoria: 'General'
            });
        expect(res.statusCode).toEqual(201);
    });

    test('Creación de tarea (Ruta protegida)', async () => {
        const res = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: 'Tarea Test',
                asignadoA: usuarioTest,
                descripcion: 'Descripción de prueba'
            });
        expect(res.statusCode).toEqual(201);
    });

    test('Denegar acceso a productos sin token', async () => {
        const res = await request(app).get('/api/productos');
        expect(res.statusCode).toEqual(401);
    });
});
