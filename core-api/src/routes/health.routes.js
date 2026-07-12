import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "core-api" });
});

export default router;
