import express from "express";
import { adminProtect } from "../middleware/auth.middleware.js";
import { issueCertificate, listCertificates, verifyCertificate } from "../controllers/certificate.controller.js";

const router = express.Router();

// Admin
router.post("/issue", adminProtect, issueCertificate);
router.get("/", adminProtect, listCertificates);

// Public verify
router.get("/verify/:certNo", verifyCertificate);

export default router;
