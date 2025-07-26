import { Router } from 'express';
import { testResources } from '../controllers/test.controller';

const router = Router();

router.get('/resources', testResources);

export default router;
