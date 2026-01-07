import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './prisma.module';

describe('PrismaModule', () => {
  let module: PrismaModule;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    module = testingModule.get<PrismaModule>(PrismaModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
