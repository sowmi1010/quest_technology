import SequenceCounter from "../models/SequenceCounter.js";
import Certificate from "../models/Certificate.js";

const CERTIFICATE_COUNTER_KEY = "certificateNo";

async function getCurrentMaxCertificateSerial() {
  const rows = await Certificate.aggregate([
    { $match: { certNo: { $type: "string", $regex: /^QT-CERT-\d{4}-\d+$/ } } },
    {
      $project: {
        serial: {
          $toInt: {
            $arrayElemAt: [{ $split: ["$certNo", "-"] }, 3],
          },
        },
      },
    },
    { $group: { _id: null, maxSerial: { $max: "$serial" } } },
  ]);

  const maxSerial = Number(rows?.[0]?.maxSerial || 0);
  return Number.isFinite(maxSerial) && maxSerial > 0 ? maxSerial : 0;
}

async function ensureCertificateCounterSeeded() {
  const existing = await SequenceCounter.findById(CERTIFICATE_COUNTER_KEY)
    .select("_id")
    .lean();
  if (existing) return;

  const maxSerial = await getCurrentMaxCertificateSerial();

  // Atomic first-write seed if multiple requests start together.
  await SequenceCounter.updateOne(
    { _id: CERTIFICATE_COUNTER_KEY },
    { $setOnInsert: { value: maxSerial } },
    { upsert: true },
  );
}

export async function getNextCertificateSerial() {
  await ensureCertificateCounterSeeded();

  const counter = await SequenceCounter.findByIdAndUpdate(
    CERTIFICATE_COUNTER_KEY,
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  )
    .select("value")
    .lean();

  return Number(counter?.value || 1);
}

export default { getNextCertificateSerial };
