import { TestimonialsService } from './testimonials.service';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    active(): import("./testimonials.service").Testimonial[];
    all(): import("./testimonials.service").Testimonial[];
    create(body: Record<string, unknown>): import("./testimonials.service").Testimonial;
    update(id: number, body: Record<string, unknown>): import("./testimonials.service").Testimonial;
    remove(id: number): {
        success: boolean;
    };
}
