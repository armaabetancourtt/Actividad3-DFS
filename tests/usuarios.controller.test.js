const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs'); 
const app = require('../server');

const Usuario = require('../models/Usuario'); 

let mongoServer;
let token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const hashedPassword = await bcrypt.hash('1234', 10);

    await Usuario.create({
        usuario: 'admin',
        password: hashedPassword
    });

    const res = await request(app)
        .post('/api/login')
        .send({ usuario: 'admin', password: '1234' });

    token = res.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('GET /api/usuarios', () => {
    it('debe devolver lista de usuarios formateada para el select de Audi', async () => {
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        expect(res.body[0]).toHaveProperty('nombre');
        expect(res.body[0]).not.toHaveProperty('password');
        expect(res.body[0]).not.toHaveProperty('usuario'); 
    });
});