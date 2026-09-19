import { Test, TestingModule } from '@nestjs/testing';
import { TenantManagementController } from './tenant-management.controller';

describe('TenantManagementController', () => {
  let controller: TenantManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantManagementController],
    }).compile();

    controller = module.get<TenantManagementController>(TenantManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
