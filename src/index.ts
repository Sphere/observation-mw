import express from "express";
import { router } from "./routes/index";
import { logger } from "./utils/logger";
const app = express();
app.use("/v1", router);
app.listen(3009, () => {
  logger.info("Sever listening on port 3009");
});
