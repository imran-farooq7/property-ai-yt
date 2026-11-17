import { z } from 'zod';

export const COMMON_AMENITIES = [
    'Swimming Pool',
    'Private Garden',
    'Attached Garage',
    'Central Air Conditioning',
    'Hardwood Flooring',
    'Chef\'s Kitchen',
    'Walk-in Closet',
    'Balcony / Terrace',
    'Fireplace',
    'Home Office',
    'Ocean / Water View',
    'Smart Home Technology',
] as const;

export const createPropertySchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    address: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(2, 'Zip code is required'),
    country: z.enum(['US', 'UK', 'AU', 'CA']).default('US'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    currency: z.enum(['USD', 'GBP', 'AUD', 'CAD']).default('USD'),
    bedrooms: z.coerce.number().int().min(0).default(0),
    bathrooms: z.coerce.number().min(0).default(1),
    sqft: z.coerce.number().positive().optional().nullable(),
    lotSize: z.coerce.number().positive().optional().nullable(),
    yearBuilt: z.coerce.number().int().min(1700).max(2030).optional().nullable(),
    propertyType: z.enum(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial']).default('house'),
    description: z.string().optional().nullable(),
    amenities: z.array(z.string()).default([]),
    heroImage: z.string().url('Please enter a valid image URL').optional().or(z.literal('')).nullable(),
    status: z.enum(['draft', 'active', 'sold', 'archived']).default('active'),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
