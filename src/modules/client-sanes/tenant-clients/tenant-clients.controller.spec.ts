import { Test, TestingModule } from '@nestjs/testing';
import { TenantClientsController } from './tenant-clients.controller';

describe('TenantClientsController', () => {
  let controller: TenantClientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantClientsController],
    }).compile();

    controller = module.get<TenantClientsController>(TenantClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
