import { Injectable, Module, Global, OnApplicationBootstrap } from '@nestjs/common';
import { JsonDbService } from './json-db.service';
import { seedDatabase } from './seed';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly db: JsonDbService) {}

  onApplicationBootstrap() {
    const { meta } = this.db.data;
    if (!this.db.data.products.length || meta.seedVersion !== 1) {
      seedDatabase(this.db);
      this.db.data.meta.secret = meta.secret;
      Object.assign(this.db.data.meta.counters, meta.counters);
      this.db.save();
    }
  }
}

@Global()
@Module({
  providers: [JsonDbService, SeedService],
  exports: [JsonDbService],
})
export class DbModule {}
