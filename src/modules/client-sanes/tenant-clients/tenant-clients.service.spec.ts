import { Test, TestingModule } from '@nestjs/testing';
import { TenantClientsService } from './tenant-clients.service';

describe('TenantClientsService', () => {
  let service: TenantClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantClientsService],
    }).compile();

    service = module.get<TenantClientsService>(TenantClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
