import { z } from 'zod';

const passwordResetSchema = z.object({
    email: z.string().email("Invalid email address")
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const parsed = passwordResetSchema.safeParse(body);
    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            message: parsed.error.errors[0]?.message || 'Invalid form submission'
        });
    }

});