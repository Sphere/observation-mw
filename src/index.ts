import express from "express";
import { router } from "./routes/index";
const app = express();
app.use("/v1", router);
app.listen(3000, () => {
  console.log("Sever listening on port 3000");
});
