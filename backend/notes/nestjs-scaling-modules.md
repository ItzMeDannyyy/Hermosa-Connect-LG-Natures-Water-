# Scaling NestJS: Multi-Module Architecture (`device`, `alert`, `room`)

When scaling a NestJS application beyond the starter `AppModule`, you organize your codebase by **Feature Modules** (Domain-Driven folders) rather than grouping by file type (like putting all controllers in one folder and all services in another).

Each feature gets its own dedicated folder inside `src/` containing its own **Module**, **Controller**, **Service**, and **Spec** files, and then registers itself inside the root `AppModule`'s `imports: []` array.

---

## 1. Scaled Folder Structure

Here is how your `src/` folder will look when scaled to include `device`, `alert`, and `room`:

```text
src/
├── device/
│   ├── device.module.ts
│   ├── device.controller.ts
│   ├── device.controller.spec.ts
│   └── device.service.ts
├── alert/
│   ├── alert.module.ts
│   ├── alert.controller.ts
│   ├── alert.controller.spec.ts
│   └── alert.service.ts
├── room/
│   ├── room.module.ts
│   ├── room.controller.ts
│   ├── room.controller.spec.ts
│   └── room.service.ts
├── app.module.ts          <-- Connects DeviceModule, AlertModule, RoomModule
├── app.controller.ts
├── app.controller.spec.ts
├── app.service.ts
└── main.ts
```

> **Pro Tip (Nest CLI):** You don't have to create these files manually! You can run these commands in your terminal and Nest will generate the folders, files, tests, and automatically wire `app.module.ts` for you:
> ```bash
> npx nest g module device && npx nest g controller device && npx nest g service device
> npx nest g module alert && npx nest g controller alert && npx nest g service alert
> npx nest g module room && npx nest g controller room && npx nest g service room
> ```
> *(Or even faster: `npx nest g resource device` to generate CRUD boilerplates all at once!)*

---

## 2. How the Root `src/app.module.ts` Changes

Remember how `imports: []` was empty in `AppModule`? When you scale to multiple modules, `AppModule` imports your feature modules:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DeviceModule } from './device/device.module.js';
import { AlertModule } from './alert/alert.module.js';
import { RoomModule } from './room/room.module.js';

@Module({
  imports: [
    DeviceModule, // <-- Registers everything in src/device
    AlertModule,  // <-- Registers everything in src/alert
    RoomModule,   // <-- Registers everything in src/room
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 3. Setting Up Each Feature Module (Current ESM Syntax)

### A. The `device` Module (`src/device/`)

#### `src/device/device.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeviceService {
  findAll() {
    return ['Water Sensor 1', 'Flow Meter 2'];
  }
}
```

#### `src/device/device.controller.ts`
Notice `@Controller('devices')` now has a string inside `()`. This prefixes all routes in this controller with `/devices`.
```typescript
import { Controller, Get } from '@nestjs/common';
import { DeviceService } from './device.service.js';

@Controller('devices') // <-- Handles http://localhost:3000/devices
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get() // <-- GET /devices
  findAll() {
    return this.deviceService.findAll();
  }
}
```

#### `src/device/device.module.ts`
Notice `exports: [DeviceService]`. If `AlertModule` ever needs to check if a device exists using `DeviceService`, exporting it here makes `DeviceService` shareable when another module imports `DeviceModule`.
```typescript
import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller.js';
import { DeviceService } from './device.service.js';

@Module({
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService], // <-- Optional: Allows other modules (like AlertModule) to use DeviceService
})
export class DeviceModule {}
```

#### `src/device/device.controller.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceController } from './device.controller.js';
import { DeviceService } from './device.service.js';

describe('DeviceController', () => {
  let controller: DeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [DeviceService],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
  });

  it('should return all devices', () => {
    expect(controller.findAll()).toEqual(['Water Sensor 1', 'Flow Meter 2']);
  });
});
```

---

### B. The `alert` Module (`src/alert/`) — *Bonus: Cross-Module Dependency!*

What if `AlertService` needs data from `DeviceService`? Here is how modules talk to each other in NestJS:

#### `src/alert/alert.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AlertController } from './alert.controller.js';
import { AlertService } from './alert.service.js';
import { DeviceModule } from '../device/device.module.js';

@Module({
  imports: [DeviceModule], // <-- 1. Import DeviceModule because it exports DeviceService
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}
```

#### `src/alert/alert.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { DeviceService } from '../device/device.service.js';

@Injectable()
export class AlertService {
  // 2. Now you can inject DeviceService directly into AlertService!
  constructor(private readonly deviceService: DeviceService) {}

  getActiveAlerts() {
    const devices = this.deviceService.findAll();
    return [`High water pressure alert on ${devices[0]}`];
  }
}
```

#### `src/alert/alert.controller.ts`
```typescript
import { Controller, Get } from '@nestjs/common';
import { AlertService } from './alert.service.js';

@Controller('alerts') // <-- Handles http://localhost:3000/alerts
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get() // <-- GET /alerts
  getAlerts() {
    return this.alertService.getActiveAlerts();
  }
}
```

---

### C. The `room` Module (`src/room/`)

#### `src/room/room.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  findAll() {
    return ['Pump Room A', 'Filtration Room B'];
  }
}
```

#### `src/room/room.controller.ts`
```typescript
import { Controller, Get } from '@nestjs/common';
import { RoomService } from './room.service.js';

@Controller('rooms') // <-- Handles http://localhost:3000/rooms
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get() // <-- GET /rooms
  findAll() {
    return this.roomService.findAll();
  }
}
```

#### `src/room/room.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { RoomController } from './room.controller.js';
import { RoomService } from './room.service.js';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
```

---

## Summary of How It All Connects

```text
                        [ AppModule ]
                  imports: [Device, Alert, Room]
                 /              |               \
                ▼               ▼                ▼
      [ DeviceModule ]   [ AlertModule ]   [ RoomModule ]
         GET /devices       GET /alerts       GET /rooms
              ▲                  │
              └──────────────────┘
        (AlertModule imports DeviceModule)
```
