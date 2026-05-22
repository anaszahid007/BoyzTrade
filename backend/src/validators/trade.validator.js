import z from "zod";


export const validateTrade = z.object({
    symbol: z.string().min(1).max(10),
    quantity: z.number().positive()
});