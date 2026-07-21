import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { addWatchlistSchema } from '../validators/watchlist.validator.js';
import { list, add, remove } from '../controllers/watchlist.controller.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.post('/', validate(addWatchlistSchema), add);
router.delete('/:symbol', remove);

export default router;
