import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_CONNECTION } from '../database/database.module.js';
import { DeviceController } from './device.controller.js';
import { DeviceService } from './device.service.js';

describe('DeviceController', () => {
  let controller: DeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        DeviceService,
        {
          provide: DATABASE_CONNECTION,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
