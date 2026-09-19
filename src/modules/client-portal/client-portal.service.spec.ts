import { Test, TestingModule } from '@nestjs/testing';
import { ClientPortalService } from './client-portal.service';

describe('ClientPortalService', () => {
  let service: ClientPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientPortalService],
    }).compile();

    service = module.get<ClientPortalService>(ClientPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
