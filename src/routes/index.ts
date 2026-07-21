import { Router } from "express";
import { authRouter } from "./auth.routes";
import { dashboardRouter } from "./dashboard.routes";
import { equipoRouter } from "./equipo.routes";
import { perforacionRouter } from "./perforacion.routes";
import { rolRouter } from "./rol.routes";
import { usuarioRouter } from "./usuario.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/roles", rolRouter);
apiRouter.use("/usuarios", usuarioRouter);
apiRouter.use("/equipos", equipoRouter);
apiRouter.use("/perforaciones", perforacionRouter);
