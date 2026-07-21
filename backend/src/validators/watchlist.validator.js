import { z } from 'zod';

export const addWatchlistSchema = z.object({
  symbol: z.string().min(1).max(10),
});

export default { addWatchlistSchema };
