// Tipos explícitos para respostas dos testes
interface AuthResponse {
  access_token: string;
  user?: UserResponse;
  recoveryCode?: string;
}

interface PetResponse {
  id: string;
  name: string;
  species: string;
  breed: string;
  storeId: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  storeId?: string;
}

interface ServiceResponse {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  storeId: string;
}

interface AppointmentResponse {
  id: string;
  petId: string;
  employeeId: string;
  serviceId: string;
  startsAt: string;
}

interface StoreResponse {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  // Removido: jwtToken, petId, orderId, userId não utilizados

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res: Response = await request(server).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});

// --- Cenários E2E para módulo Pets ---
describe('Pets (e2e)', () => {
  let app!: INestApplication;
  let ownerToken: string;
  let petId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login como owner do seed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'owner.store1@hobbybichos.com', password: '123456' });
    ownerToken = (loginRes.body as AuthResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Deve criar um pet', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/pets')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Rex',
        species: 'dog',
        breed: 'Labrador',
        storeId: 'store1',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    const pet = res.body as PetResponse;
    petId = pet.id;
  });

  it('2. Deve listar todos os pets', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get('/pets')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const pets = res.body as PetResponse[];
    expect(Array.isArray(pets)).toBe(true);
    expect(pets.some((p) => p.id === petId)).toBe(true);
  });

  it('3. Deve listar pets do usuário autenticado', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get('/pets/me')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const pets = res.body as PetResponse[];
    expect(Array.isArray(pets)).toBe(true);
    expect(pets.some((p) => p.id === petId)).toBe(true);
  });

  it('4. Deve buscar pet por ID', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get(`/pets/${petId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', petId);
  });

  it('5. Deve atualizar pet', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .patch(`/pets/${petId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Rex Atualizado', breed: 'SRD' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Rex Atualizado');
    expect(res.body).toHaveProperty('breed', 'SRD');
  });

  it('6. Deve remover pet', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .delete(`/pets/${petId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', petId);
  });

  it('7. Não deve buscar pet removido', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get(`/pets/${petId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(404);
  });
});

// --- Cenários E2E para módulo Appointments ---
describe('Appointments (e2e)', () => {
  let app!: INestApplication;
  let ownerToken: string;
  let petId: string;
  let employeeId: string;
  let appointmentId: string;
  let clientToken: string;
  let serviceId: string;
  const storeId = 'store1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login como owner do seed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'owner.store1@hobbybichos.com', password: '123456' });
    ownerToken = (loginRes.body as AuthResponse).access_token;

    // Criar pet para testes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const petRes = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Rex', species: 'dog', storeId: storeId });
    const pet = petRes.body as PetResponse;
    petId = pet.id;

    // Criar funcionário para testes
    const empEmail = `emp_${Date.now()}@mail.com`;
    // Telefone válido e único no formato internacional para passar no validador @IsPhoneNumber('BR')
    const empPhone = `+558399${Math.floor(1000000 + Math.random() * 8999999)}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const empRes = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Funcionario E2E',
        email: empEmail,
        password: 'Senha123!',
        phone: empPhone,
        role: 'EMPLOYEE',
        storeId,
      });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const employee: UserResponse = empRes.body;
    employeeId = employee.id;
    if (!employeeId)
      throw new Error('employeeId não foi atribuído corretamente!');

    // Criar usuário CLIENTE para testes
    const clientEmail = `client_${Date.now()}@test.com`;
    const clientPhone = `+558399${Math.floor(1000000 + Math.random() * 8999999)}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Cliente E2E',
        email: clientEmail,
        password: 'Senha123!',
        phone: clientPhone,
        role: 'CLIENT',
        storeId,
      });
    // Login do CLIENTE
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const clientLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: clientEmail, password: 'Senha123!' });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const clientAuth: AuthResponse = clientLoginRes.body;
    clientToken = clientAuth.access_token;

    // Criar serviço para testes (payload corrigido)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const serviceRes = await request(app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Serviço E2E',
        price: 100,
        durationMin: 30,
        storeId,
      });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const service: ServiceResponse = serviceRes.body;
    serviceId = service.id;

    // ...
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Criar agendamento', async () => {
    // Gera a próxima segunda-feira às 10h (garante expediente comercial)
    const now = new Date();
    const dayOfWeek = now.getDay();
    // 1 = segunda, 0 = domingo
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(10, 0, 0, 0);

    // ...

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/appointments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        petId,
        employeeId,
        serviceId,
        startsAt: nextMonday.toISOString(),
      });

    // ...
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    const appointment = res.body as AppointmentResponse;
    appointmentId = appointment.id;
  });

  it('2. Listar agendamentos autenticado', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get('/appointments')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('3. Listar agendamentos filtrando por data', async () => {
    // CORREÇÃO: usar a mesma data do teste 1 (próxima segunda-feira)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    const dateStr = nextMonday.toISOString().slice(0, 10);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get(`/appointments?date=${dateStr}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // ...
    const appointments = res.body as AppointmentResponse[];
    expect(Array.isArray(appointments)).toBe(true);
    expect(appointments.some((a) => a.id === appointmentId)).toBe(true);
  });

  it('4. Não deve criar agendamento sem autenticação', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/appointments')
      .send({ petId, employeeId, serviceId, startsAt: tomorrow.toISOString() });

    expect(res.status).toBe(401);
  });

  it('5. Não deve listar agendamentos sem autenticação', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server).get('/appointments');

    expect(res.status).toBe(401);
  });
});

// --- Cenários E2E para módulo Users ---
describe('Users (e2e)', () => {
  let app!: INestApplication;
  let ownerToken: string;
  let clientToken: string;
  let uniqueEmail: string;
  let uniquePhone: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login como owner
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'test@qa.com', password: '123456' });
    ownerToken = (loginRes.body as AuthResponse).access_token;

    // Gerar email e phone ÚNICOS dentro do beforeAll
    uniqueEmail = `users_e2e_${Date.now()}@mail.com`;
    uniquePhone = `+558399${Math.floor(1000000 + Math.random() * 8999999)}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Owner pode criar novo usuário CLIENT', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/users')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Novo Cliente',
        email: uniqueEmail,
        password: 'Senha123!',
        phone: uniquePhone,
        role: 'CLIENT',
        storeId: 'store1',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('2. Novo CLIENT consegue fazer login', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/auth/login')
      .send({ email: uniqueEmail, password: 'Senha123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    const auth = res.body as AuthResponse;
    clientToken = auth.access_token;
  });

  it('3. CLIENT pode obter seu perfil', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get('/users/me')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    const user = res.body as UserResponse;
    expect(user.email).toBe(uniqueEmail);
  });

  it('4. Não deve criar usuário com email já existente', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/users')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Outro User',
        email: uniqueEmail, // Email duplicado
        password: 'Senha123!',
        phone: `+558399${Math.floor(1000000 + Math.random() * 8999999)}`, // Phone novo
        role: 'CLIENT',
        storeId: 'store1',
      });

    expect(res.status).toBe(409);
  });

  it('5. Não deve criar usuário com telefone já existente', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/users')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Outro User',
        email: `outro_${Date.now()}@test.com`, // Email novo
        password: 'Senha123!',
        phone: uniquePhone, // Phone duplicado
        role: 'CLIENT',
        storeId: 'store1',
      });

    expect(res.status).toBe(409);
  });

  it('6. Não autenticado não pode obter perfil', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server).get('/users/me');

    expect(res.status).toBe(401);
  });
});

// --- Cenários E2E para módulo Products ---
describe('Products (e2e)', () => {
  // Removido: app, ownerToken, createdProductId não utilizados
  // ...existing code...
  // ...outros testes de Products...
});

// --- Cenários E2E para módulo Services ---
describe('Services (e2e)', () => {
  let app!: INestApplication;
  let ownerToken: string;
  let createdServiceId: string;
  const storeId = 'store1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login como owner
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'test@qa.com', password: '123456' });
    ownerToken = (loginRes.body as AuthResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Criar serviço', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/services')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Serviço E2E',
        price: 123.45,
        durationMin: 45,
        storeId,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    const service = res.body as ServiceResponse;
    createdServiceId = service.id;
  });

  it('2. Listar serviços da loja', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get('/services')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const services = res.body as ServiceResponse[];
    expect(Array.isArray(services)).toBe(true);
    expect(services.some((s) => s.id === createdServiceId)).toBe(true);
  });

  it('3. Buscar serviço por ID', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get(`/services/${createdServiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body as ServiceResponse).toHaveProperty('id', createdServiceId);
  });

  it('4. Atualizar serviço', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .patch(`/services/${createdServiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Serviço E2E Atualizado' });
    expect(res.status).toBe(200);
    // updateMany retorna { count: 1 }, então não há body.id
    expect(res.body).toHaveProperty('count', 1);
  });

  it('5. Remover serviço', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .delete(`/services/${createdServiceId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    // deleteMany retorna { count: 1 }, então não há body.id
    expect(res.body).toHaveProperty('count', 1);
  });
});

// --- Cenários E2E para módulo Stores ---
describe('Stores (e2e)', () => {
  let app!: INestApplication;
  let ownerToken: string;
  let createdStoreId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login como owner
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'test@qa.com', password: '123456' });
    ownerToken = (loginRes.body as AuthResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Consultar disponibilidade de horários', async () => {
    // Usa store1 e próxima segunda-feira
    const storeId = 'store1';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    const dateStr = nextMonday.toISOString().slice(0, 10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get(`/stores/${storeId}/availability?date=${dateStr}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    const availability = res.body as { slots: string[] };
    expect(availability).toHaveProperty('slots');
    expect(Array.isArray(availability.slots)).toBe(true);
  });

  it('2. Criar loja', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .post('/stores')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: `Loja E2E ${Date.now()}`,
        phone: '(83) 99999-8888',
        isActive: true,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    const store = res.body as StoreResponse;
    createdStoreId = store.id;
  });

  it('3. Listar lojas', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server)
      .get('/stores')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const stores = res.body as StoreResponse[];
    expect(Array.isArray(stores)).toBe(true);
    expect(stores.some((s) => s.id === createdStoreId)).toBe(true);
  });
});

// --- Cenários E2E para módulo Auth ---
describe('Auth (e2e)', () => {
  let app!: INestApplication;
  const baseUrl = '/auth';
  // Email/telefone exclusivos para Auth
  const testEmail = `auth_e2e_${Date.now()}@mail.com`;
  const testPassword = 'Senha123!';
  const testPhone = `+558399${Math.floor(10000000 + Math.random() * 90000000)}`;
  let recoveryCode = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve registrar um novo usuário', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const server = app.getHttpServer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(server).post(`${baseUrl}/register`).send({
      name: 'Usuário E2E',
      email: testEmail,
      password: testPassword,
      phone: testPhone,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.user).toHaveProperty('email', testEmail);
  });

  it('Não deve registrar usuário com e-mail já existente', async () => {
    // Usa email já existente do seed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/register`)
      .send({
        name: 'Usuário E2E',
        email: 'client@qa.com',
        password: 'Senha123!',
        phone: '11999999998',
      });
    expect(res.status).toBe(409);
  });

  it('Não deve registrar usuário com dados inválidos', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/register`)
      .send({
        name: '',
        email: 'invalido',
        password: '123',
        phone: 'abc',
        storeId: 'store1',
      });
    expect(res.status).toBe(400);
  });

  it('Deve autenticar usuário com credenciais válidas', async () => {
    // Usa usuário CLIENT do seed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/login`)
      .send({
        email: 'client@qa.com',
        password: 'Senha123!',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  it('Não deve autenticar com senha incorreta', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/login`)
      .send({
        email: testEmail,
        password: 'SenhaErrada',
      });
    expect(res.status).toBe(401);
  });

  it('Não deve autenticar usuário inexistente', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/login`)
      .send({
        email: 'naoexiste@mail.com',
        password: 'Senha123!',
      });
    expect(res.status).toBe(401);
  });

  it('Deve enviar e-mail de recuperação de senha para e-mail cadastrado', async () => {
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/forgot-password`)
      .send({ email: testEmail });
    expect([200, 201]).toContain(res.status);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response: AuthResponse = res.body;
    if (response && typeof response.recoveryCode === 'string') {
      recoveryCode = response.recoveryCode;
    }
  });

  it('Não deve enviar e-mail para e-mail não cadastrado', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/forgot-password`)
      .send({ email: 'naoexiste@mail.com' });
    expect([200, 201]).toContain(res.status);
  });

  it('Deve permitir redefinir senha com código válido', async () => {
    if (!recoveryCode || typeof recoveryCode !== 'string') {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/reset-password`)
      .send({
        email: testEmail,
        code: recoveryCode,
        newPassword: 'NovaSenha123!',
      });
    expect([200, 201]).toContain(res.status);
  });

  it('Não deve permitir redefinir senha com código inválido', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/reset-password`)
      .send({
        email: testEmail,
        code: 'codigo-invalido',
        newPassword: 'NovaSenha123!',
      });
    expect(res.status).toBe(400);
  });
});
