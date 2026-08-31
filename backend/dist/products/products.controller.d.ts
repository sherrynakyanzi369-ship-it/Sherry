import { ProductsService } from './products.service';
import type { CatalogQuery } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(query: CatalogQuery): import("../db/json-db.service").Product[];
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
    bySlug(slug: string): import("../db/json-db.service").Product;
    related(slug: string): import("../db/json-db.service").Product[];
}
