import mongoose from "mongoose";
import { ZodError } from "zod";

export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
}

function isZodValidationError(err) {
  return (
    err instanceof ZodError ||
    err?.name === "ZodError" ||
    Array.isArray(err?.issues)
  );
}

function buildZodFieldErrors(err) {
  const issues = Array.isArray(err?.issues) ? err.issues : [];

  const fieldErrors = issues.reduce((acc, issue) => {
    const pathParts = Array.isArray(issue?.path) ? issue.path : [];
    const path = pathParts.length ? pathParts.join(".") : "_root";
    const message = issue?.message || "Invalid value";

    if (!acc[path]) acc[path] = [];
    acc[path].push(message);
    return acc;
  }, {});

  return {
    issues: issues.map((issue) => ({
      path: Array.isArray(issue?.path) ? issue.path : [],
      message: issue?.message || "Invalid value",
      code: issue?.code || "invalid",
    })),
    fieldErrors,
  };
}

function isMongooseValidationError(err) {
  return (
    err instanceof mongoose.Error.ValidationError ||
    (err?.name === "ValidationError" && typeof err?.errors === "object")
  );
}

function buildMongooseFieldErrors(err) {
  const source = err?.errors && typeof err.errors === "object" ? err.errors : {};
  const fieldErrors = {};

  for (const [field, item] of Object.entries(source)) {
    fieldErrors[field] = item?.message || "Invalid value";
  }

  return fieldErrors;
}

function isMongooseCastError(err) {
  return err instanceof mongoose.Error.CastError || err?.name === "CastError";
}

export function errorHandler(err, req, res, next) {
  if (isZodValidationError(err)) {
    const details = buildZodFieldErrors(err);
    return res.status(400).json({
      ok: false,
      message: err.issues?.[0]?.message || "Validation failed",
      ...details,
    });
  }

  if (isMongooseValidationError(err)) {
    const fieldErrors = buildMongooseFieldErrors(err);
    const firstField = Object.keys(fieldErrors)[0];

    return res.status(400).json({
      ok: false,
      message: firstField ? fieldErrors[firstField] : "Validation failed",
      fieldErrors,
    });
  }

  if (isMongooseCastError(err)) {
    const field = String(err?.path || "id") === "_id" ? "id" : String(err?.path || "id");
    const value = err?.value;

    return res.status(400).json({
      ok: false,
      message: field === "id" ? "Invalid id" : `Invalid ${field}`,
      field,
      value,
    });
  }

  const explicitStatus = Number(err?.statusCode || err?.status || 0);
  const statusCode =
    explicitStatus > 0 ? explicitStatus : res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    ok: false,
    message: err?.message || "Server Error",
  });
}
