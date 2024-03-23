import cluster from "cluster";
import os from "os";
import * as path from "path";
import * as hbs from "express-handlebars";
import * as status from "express-status-monitor";
import bodyParser from "body-parser";
import helmet from "helmet";
import { ExpressRouter } from "./routers/_router";
import { helpers } from "./../client/views/engine/helper";
import express from "express";
import { userController } from "./controllers/user.controller";

const cCPUs = os.cpus().length;
const app = express();
const port: string | number = process.env.PORT || 8090;
app.use(express.urlencoded({ extended: false }));
if (cluster.isMaster) {
  console.log(`Number of CPUs is ${cCPUs}`);
  // @ts-ignore
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < cCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} 🤖 died ☠️`);
    console.log("🤖 Let's fork another worker!");
    cluster.fork();
  });
} else {
  app.use(status());
  app.set("port", process.env.PORT || 8080);
  app.engine(
    "hbs",
    hbs.engine({
      extname: ".hbs",
      helpers,
    })
  );
  app.set("views", path.join(__dirname, "../client/views"));
  app.set("view engine", "hbs");
  app.use(
    bodyParser.json({
      limit: "500mb",
    })
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: "500MB",
    })
  );
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE, PATCH"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, X-Requested-With, Session, authorization, x-api-key"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    // Pass to next layer of middleware
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["*", "'self'"],
          "connect-src": ["https:", "http:", "ws:", "wss:", "data:", "blob:"],
          "script-src": ["*","'self'", "'unsafe-inline'", "'unsafe-eval'", "data:", "blob:"],
          "style-src": ["*", "'unsafe-inline'", "'self'", "https://*.fontawesome.com/*"],
          "img-src": ["*","'self'", "'unsafe-inline'", "'unsafe-eval'", "data:"],
        },
      },
    })
  );
  app.get("/", async (req, res, next) => {
    try {
      userController.getAllUsersInTheLast2Hours().then((users) => {
        res.render("home", { title: "The Pursuit", users });
      });
    } catch (err) {
      // Call the next middleware with the error
      res.json(err);
    }
  });app.get("/control", async (req, res, next) => {
    try {
      userController.getAllUsersInTheLast2Hours().then((users) => {
        res.render("control", { title: "The Pursuit", users });
      });
    } catch (err) {
      // Call the next middleware with the error
      res.json(err);
    }
  });

  const serveStaticGzippedFile = (
    contentType,
    folderName,
    isGzipped = true
  ) => {
    return (req, res, next) => {
      // Check if the environment is development
      const isDevelopment = process.env.NODE_ENV === "development";
      // Update isGzipped based on the environment
      isGzipped = isGzipped && !isDevelopment;

      const urlParts = req.url.split("/");
      const filename = urlParts.pop() + (isGzipped ? ".gz" : "");

      const file = urlParts.includes(folderName)
        ? `/${folderName}/${filename}`
        : filename;

      if (isGzipped) {
        res.set("Content-Encoding", "gzip");
      }

      res.set("Content-Type", contentType);
      res.sendFile(file, {
        dotfiles: "allow",
        root: "./dist/client/public/assets",
      });
    };
  };
  app.get("*.js", serveStaticGzippedFile("text/javascript", "js"));
  app.get("*/fonts/*", serveStaticGzippedFile("font/opentype", "fonts", false));
  app.get("*/images/*", serveStaticGzippedFile("image/jpeg", "images", false)); // or whatever your common image type is
  app.get("*.css", serveStaticGzippedFile("text/css", "css", false));
  app.use(
    express.static("./dist/client/public/assets", {
      maxAge: "0",
      dotfiles: "allow",
    })
  );
  // ROUTE API V1
  app.use(`/api/v1`, ExpressRouter);
  app.get("/apiCluster/:n", (req, res) => {
    // tslint:disable-next-line: radix
    let n = parseInt(req.params.n);
    let count = 0;
    if (n > 5000000000) {
      n = 5000000000;
    }
    for (let i = 0; i <= n; i++) {
      count += i;
    }
    res.send(`Final count is ${count}`);
  });
  app.listen(port, () => {
    console.log(`⚡️[server]: http://localhost:${port}`);
  });
}
