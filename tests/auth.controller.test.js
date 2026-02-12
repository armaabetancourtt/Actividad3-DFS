const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Autenticación', () => {

    it('debe registrar un usuario', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                usuario: 'nuevo',
                password: '1234'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('mensaje');
    });

    it('debe permitir login y devolver token', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                usuario: 'nuevo',
                password: '1234'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

});
