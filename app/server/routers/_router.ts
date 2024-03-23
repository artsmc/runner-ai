import rateLimit from "express-rate-limit";
import { Request, Response, Router } from "express";
import { UserRouter } from "./user.routes";

// Assign router to the express.Router() instance
const router: Router = Router();
const APILimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 500,
  message:
    "Too many request created from this IP. Limit 500 request per minute.",
});
const APILimiterStrict = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 200,
  message:
    "Too many request created from this IP. Limit 200 request per minute.",
});
const APILimiterFeirce = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  message:
    "Too many request created from this IP. Limit 60 request per minute.",
});
const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};
const timeRequest = (req, res, next) => {
  console.log(
    JSON.stringify({
      METHOD: req.method,
      DATE: new Date().toString(),
      ACTION: req.originalUrl,
      QUERY: JSON.stringify(req.query),
      // BODY: JSON.stringify(req.body)
    })
  );
  const start = process.hrtime();
  res.on("close", () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    console.log(
      `[COMPLETED REQUEST: ${durationInMilliseconds.toLocaleString()} ms - ${
        process.pid
      }]
      [ACTION: ${req.originalUrl}]
      [STATUS: ${res.statusCode}]
      `
    );
  });
  next();
};
router.get("/test", APILimiter, (req: Request, res: Response) => {
  res.status(200).json({ msg: "Hello World" });
});
router.get("/", APILimiter, (req: Request, res: Response) => {
  res.status(200).json({ msg: "Hello World" });
});
router.get(
  "/test-feirce",
  APILimiterFeirce,
  (req: Request, res: Response) => {}
);
router.use("/user", timeRequest, APILimiter, UserRouter);

export const ExpressRouter: Router = router;
