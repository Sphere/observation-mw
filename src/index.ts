import express from "express";
import { router } from "./routes/index";
import { logger } from "./utils/logger";
import { authCheck } from "../src/utils/authCheck";
import { bodyParser } from "body-parser"

const app = express();

app.use((req, _res, next) => {
  logger.info(`Requested Route: ${req.method} ${req.url}`);
  next();
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(authCheck);
app.use("/v1", router);
app.listen(3009, () => {
  logger.info("Sever listening on port 3009");
});
