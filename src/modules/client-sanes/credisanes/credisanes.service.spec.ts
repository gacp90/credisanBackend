import { Test, TestingModule } from '@nestjs/testing';
import { CredisanesService } from './credisanes.service';

describe('CredisanesService', () => {
  let service: CredisanesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredisanesService],
    }).compile();

    service = module.get<CredisanesService>(CredisanesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
