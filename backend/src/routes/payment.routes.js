import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";

import {
  addPayment,
  getPaymentsOverview,
  getStudentPayments,
  deletePayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", adminProtect, addPayment);
router.get("/overview", adminProtect, getPaymentsOverview);
router.get("/student/:studentId", adminProtect, getStudentPayments);
router.delete("/:id", adminProtect, deletePayment);

export default router;
