import { Test, TestingModule } from '@nestjs/testing';
import { CredisanesController } from './credisanes.controller';

describe('CredisanesController', () => {
  let controller: CredisanesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredisanesController],
    }).compile();

    controller = module.get<CredisanesController>(CredisanesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
