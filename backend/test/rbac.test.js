const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

// ensure a JWT secret for tests before loading app
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

const app = require('../src/app');
const request = supertest(app);

function signAs(role, payload = {}) {
  const token = jwt.sign({ role, username: `${role}_user`, user_id: 1, ...payload }, process.env.JWT_SECRET);
  return `Bearer ${token}`;
}

// Try to login with a real ChiefEditor account if available
const CHIEF_USER = process.env.CHIEF_USER || 'chiefeditor';
const CHIEF_PASS = process.env.CHIEF_PASS || 'thanh123';
let chiefToken = null;

const { before } = require('node:test');
before(async () => {
  try {
    const res = await request.post('/api/users/login')
      .set('Content-Type', 'application/json')
      .send({ username: CHIEF_USER, password: CHIEF_PASS });
    const tokenFrom = res.body?.token || res.body?.data?.token;
    if (res.status === 200 && tokenFrom) {
      chiefToken = `Bearer ${tokenFrom}`;
    }
  } catch (e) {
    // ignore, keep chiefToken = null
  }
});

const routes = {
  createPost: { method: 'post', url: '/api/posts', multipart: { post_title: `t_${Date.now()}`, post_content: 'c' } },
  updatePost: { method: 'put', url: '/api/posts/1', body: { post_title: 't2' } },
  readLM: { method: 'get', url: '/api/league-managers' },
  assignLM: { method: 'post', url: '/api/league-managers', body: { user_id: 2, league_id: 3 } },
  createClub: { method: 'post', url: '/api/clubs', body: { club_name: 'x' } },
};

async function callWithAuth(route, auth) {
  let req = request[route.method](route.url).set('Authorization', auth);
  if (route.multipart) {
    // simulate multipart/form-data for multer routes
    Object.entries(route.multipart).forEach(([k, v]) => {
      req = req.field(k, String(v));
    });
    return req;
  }
  req = req.set('Content-Type', 'application/json');
  if (route.body) req.send(route.body);
  return req;
}

test('editor cannot assign league manager', async () => {
  const res = await callWithAuth(routes.assignLM, signAs('editor'));
  assert.strictEqual(res.status, 403);
});

test('chief_editor (real account if available) can GET league-managers (read permission)', async (t) => {
  if (!chiefToken) {
    t.diagnostic('No real chief editor token available, skipping real-account check');
    t.skip();
    return;
  }
  const res = await callWithAuth(routes.readLM, chiefToken);
  // Chỉ xác nhận không bị 401/403 (đã qua authorize). Có thể 4xx/5xx do business/DB.
  assert.notStrictEqual([401,403].includes(res.status), true, `Should not be 401/403, got ${res.status}`);
});

test('league_manager cannot create club (no create permission)', async () => {
  const res = await callWithAuth(routes.createClub, signAs('league_manager'));
  assert.strictEqual(res.status, 403);
});

test('editor can create and update post', async () => {
  const create = await callWithAuth(routes.createPost, signAs('editor'));
  assert.notStrictEqual([401,403].includes(create.status), true);

  const update = await callWithAuth(routes.updatePost, signAs('editor'));
  assert.notStrictEqual([401,403].includes(update.status), true);
});

test('basic user cannot create post', async () => {
  const res = await callWithAuth(routes.createPost, signAs('user'));
  assert.strictEqual(res.status, 403);
});
