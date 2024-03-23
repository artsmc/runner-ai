import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';

const APILimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min 
  max: 500,
  message:    
    'Too many request created from this IP. Limit 500 request per minute.'
});
const router: Router = Router();
router.get('/test', APILimiter, (req: Request, res: Response) => {
  res.status(200).json({ msg: 'Hello World' });
});
router.get('/', APILimiter, (req: Request, res: Response) => {
  res.status(200).json({ msg: 'Hello World' });
});

export const IndexRouter: Router = router;
