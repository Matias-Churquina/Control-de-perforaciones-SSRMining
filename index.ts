import { env } from "./src/config/env";
import { app } from "./src/app";

app.listen(env.port, () => {
  console.log(`SSRMining API running on port ${env.port}`);
});
