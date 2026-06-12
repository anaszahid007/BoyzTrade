import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { list, add, remove } from '../controllers/watchlist.controller.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.post('/', add);
router.delete('/:symbol', remove);

export default router;
