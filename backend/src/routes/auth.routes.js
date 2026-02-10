import express from "express";
import { loginAdmin, registerAdmin, meAdmin } from "../controllers/auth.controller.js";
import { adminProtect } from "../middleware/auth.middleware.js";

const router = express.Router();

// first time only (create admin). later you can remove.
router.post("/register", registerAdmin);

router.post("/login", loginAdmin);
router.get("/me", adminProtect, meAdmin);

export default router;
