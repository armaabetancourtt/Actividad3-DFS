const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Pruebas Unitarias - Sistema Audi', () => {
    let token;
    let usuarioId;
    const credenciales = { usuario: `user_${Date.now()}`, password: '123' };

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Registro de Usuario', async () => {
        const res = await request(app)
            .post('/api/register')
            .send(credenciales);
        expect(res.statusCode).toEqual(201);
    });

    test('Login y Generación de Token', async () => {
        const res = await request(app)
            .post('/api/login')
            .send(credenciales);
        expect(res.statusCode).toEqual(200);
        token = res.body.token;
    });

    test('Creación de Producto (Validación de Esquema)', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: "Audi A4 Model",
                img: "https://r.ed987f7ec5146198dd4858966e2ee2c5.com/img.jpg",
                precio: 500,
                stock: 5,
                categoria: "Coleccionables"
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('Creación de Tarea (Validación de Enum y Trim)', async () => {
        const res = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: "  Mantenimiento Preventivo  ",
                creadaPor: credenciales.usuario,
                asignadoA: "Mecánico A",
                estado: "Sin Iniciar"
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.titulo).toBe("Mantenimiento Preventivo");
    });

    test('Error al usar un Estado no permitido en Tarea', async () => {
        const res = await request(app)
            .post('/api/tareas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: "Error Test",
                creadaPor: "Admin",
                asignadoA: "User",
                estado: "Inexistente"
            });
        expect(res.statusCode).toEqual(400);
    });
});
