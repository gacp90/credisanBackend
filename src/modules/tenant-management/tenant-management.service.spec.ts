import { Test, TestingModule } from '@nestjs/testing';
import { TenantManagementService } from './tenant-management.service';

describe('TenantManagementService', () => {
  let service: TenantManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantManagementService],
    }).compile();

    service = module.get<TenantManagementService>(TenantManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
