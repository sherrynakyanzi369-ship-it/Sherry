import { JsonDbService } from '../db/json-db.service';
import { Product } from '../db/json-db.service';
export interface CatalogQuery {
    q?: string;
    category?: string;
    family?: string;
    gender?: string;
    type?: string;
    inStock?: boolean;
    sort?: string;
    includeInactive?: boolean;
}
export declare class ProductsService {
    private readonly db;
    constructor(db: JsonDbService);
    private all;
    publicProducts(): Product[];
    query(query: CatalogQuery): Product[];
    priceOf(p: Product): number;
    discountPct(p: Product): number;
    stockOf(p: Product): number;
    findBySlug(slug: string): Product;
    related(slug: string): Product[];
    meta(): {
        categories: ({
            count: number;
            slug: "women";
            label: "Women's Fragrances";
        } | {
            count: number;
            slug: "men";
            label: "Men's Fragrances";
        } | {
            count: number;
            slug: "unisex";
            label: "Unisex Fragrances";
        } | {
            count: number;
            slug: "perfume-oils";
            label: "Perfume Oils";
        } | {
            count: number;
            slug: "body-sprays";
            label: "Body Sprays";
        } | {
            count: number;
            slug: "gift-sets";
            label: "Gift Sets";
        })[];
        families: string[];
        types: string[];
        genders: string[];
        priceBounds: {
            min: number;
            max: number;
        };
    };
}
