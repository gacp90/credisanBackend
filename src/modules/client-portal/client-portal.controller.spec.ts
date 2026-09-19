import { Test, TestingModule } from '@nestjs/testing';
import { ClientPortalController } from './client-portal.controller';

describe('ClientPortalController', () => {
  let controller: ClientPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientPortalController],
    }).compile();

    controller = module.get<ClientPortalController>(ClientPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
