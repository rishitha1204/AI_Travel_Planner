import { z } from 'zod';
import { ACTIVITY_CATEGORIES } from './trip.model.js';

const coordinatesSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .optional();

const destinationSchema = z.object({
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  coordinates: coordinatesSchema,
});

const budgetSchema = z.object({
  total: z.number().positive('Budget total must be greater than 0'),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter code (e.g. USD)')
    .toUpperCase(),
});

export const createTripSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    destination: destinationSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    budget: budgetSchema,
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const updateTripSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    destination: destinationSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    budget: budgetSchema.optional(),
    status: z.enum(['draft', 'confirmed', 'completed']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .refine((data) => !(data.startDate && data.endDate) || data.endDate > data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const tripListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['draft', 'confirmed', 'completed']).optional(),
});

export const tripIdParamSchema = z.object({
  tripId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid trip id'),
});

const activityInputSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be in HH:MM 24-hour format'),
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(500).optional(),
  estimatedCost: z.number().min(0),
  category: z.enum(ACTIVITY_CATEGORIES),
  location: z
    .object({
      name: z.string().trim().max(140).optional(),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
  durationMinutes: z.number().int().min(1).max(24 * 60),
});

// A single PATCH endpoint handles every itinerary mutation via a
// discriminated union on `action` -- one route instead of three, while each
// action still gets its own strictly-validated required shape.
export const itineraryPatchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('addActivity'),
    day: z.number().int().min(1),
    activity: activityInputSchema,
  }),
  z.object({
    action: z.literal('updateActivity'),
    day: z.number().int().min(1),
    activityId: z.string().min(1),
    updates: activityInputSchema
      .partial()
      .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' }),
  }),
  z.object({
    action: z.literal('removeActivity'),
    day: z.number().int().min(1),
    activityId: z.string().min(1),
  }),
]);