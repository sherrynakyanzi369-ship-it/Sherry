import { OnApplicationBootstrap } from '@nestjs/common';
import { JsonDbService } from './json-db.service';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly db;
    constructor(db: JsonDbService);
    onApplicationBootstrap(): void;
}
export declare class DbModule {
}
