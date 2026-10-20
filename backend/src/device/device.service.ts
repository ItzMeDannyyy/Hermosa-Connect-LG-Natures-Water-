import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../database/database.module.js';
import { devices, type NewDevice } from '../database/schema/index.js';

@Injectable()
export class DeviceService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  findAll() {
    return this.db.select().from(devices);
  }

  async findOne(id: number) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(eq(devices.id, id));
    return device;
  }

  async create(data: NewDevice) {
    const [created] = await this.db.insert(devices).values(data).returning();
    return created;
  }

  async update(id: number, data: Partial<NewDevice>) {
    const [updated] = await this.db
      .update(devices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .delete(devices)
      .where(eq(devices.id, id))
      .returning();
    return deleted;
  }
}