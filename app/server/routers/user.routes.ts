import { Request, Response, Router } from "express";
import url from "url";
import { userController } from "../controllers/user.controller";
import { UserModel } from "../db/users/user.model";
const router: Router = Router();

router.get("/test", (req: Request, res: Response) => {
  res.status(200).json({});
});
router.get("/find/:user", (req: Request, res: Response) => {
  const user = req.params.user;
  userController.getUser(user).then((result) => {
    res.status(200).json(result);
  }).catch((error) => {
    res.status(500).json(error);
  });
});
router.get("/all", (req: Request, res: Response) => {
  userController.getAllUsersInTheLast2Hours().then((result) => {
    res.status(200).json(result);
  }).catch((error) => {
    res.status(500).json(error);
  })
});
router.post("/create", (req: Request, res: Response) => {
  const user = req.body;
  userController.createUser(user).then((result) => {
    res.status(200).json(result);
  }).catch((error) => {
    res.status(500).json(error);
  });
});
router.post("/update-offset", (req: Request, res: Response) => {
  const user = req.body;
  userController.modifyUserOffset(user).then((result) => {
    res.status(200).json(result);
  }).catch((error) => {
    res.status(500).json(error);
  });
});
router.post("/update-all-offset", async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    const completed = [];

    // Use Promise.all() to wait for all operations to be done before sending response
    // This will also add every user to 'completed' array once their offset is modified
    await Promise.all(users.map(async (user) => {
      await userController.modifyUserOffset({user: user.user, offset: 100});
      completed.push(user);
    }));
    res.status(200).json(completed);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.post("/update-modified/:id", (req: Request, res: Response) => {
  const user = req.params.id;
  userController.modifyUserModifiedDate(user).then((result) => {
    res.status(200).json(result);
  }).catch((error) => {
    res.status(500).json(error);
  });
});

export const UserRouter: Router = router;
