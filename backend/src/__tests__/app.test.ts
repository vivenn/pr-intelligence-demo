import request from 'supertest';
import { createApp } from '../app';

describe('app', () => {
  const app = createApp();

  it('GET /health returns ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: 'ok' } });
  });
});
