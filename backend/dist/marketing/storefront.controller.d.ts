import { StorefrontService } from './storefront.service';
export declare class StorefrontController {
    private readonly storefrontService;
    constructor(storefrontService: StorefrontService);
    home(): {
        featured: import("../db/json-db.service").Product[];
        flashSales: import("../db/json-db.service").Product[];
        newArrivals: import("../db/json-db.service").Product[];
        bestSellers: import("../db/json-db.service").Product[];
        categories: {
            slug: "women" | "men" | "unisex" | "perfume-oils" | "body-sprays" | "gift-sets";
            label: "Women's Fragrances" | "Men's Fragrances" | "Unisex Fragrances" | "Perfume Oils" | "Body Sprays" | "Gift Sets";
            count: number;
            image: string | null;
        }[];
        notes: string[];
        banners: import("../db/json-db.service").Banner[];
        testimonials: import("./testimonials.service").Testimonial[];
        delivery: {
            readonly standard: 4.99;
            readonly express: 12.99;
            readonly freeThreshold: 75;
            readonly freeExpressThreshold: 200;
        };
        store: {
            readonly name: "Sherriez Scents";
            readonly tagline: "Fragrances that tell your story";
            readonly email: "hello@sherriezscents.com";
            readonly phone: "+1 (555) 012-3456";
            readonly address: "12 Amber Lane, Fragrance District, Metro City";
        };
    };
}
