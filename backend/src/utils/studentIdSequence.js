import SequenceCounter from "../models/SequenceCounter.js";
import Student from "../models/Student.js";

const STUDENT_COUNTER_KEY = "studentId";

async function getCurrentMaxStudentSerial() {
  const rows = await Student.aggregate([
    { $match: { studentId: { $type: "string", $regex: /^STU\d+$/ } } },
    {
      $project: {
        serial: {
          $toInt: {
            $substrCP: [
              "$studentId",
              3,
              { $subtract: [{ $strLenCP: "$studentId" }, 3] },
            ],
          },
        },
      },
    },
    { $group: { _id: null, maxSerial: { $max: "$serial" } } },
  ]);

  const maxSerial = Number(rows?.[0]?.maxSerial || 0);
  return Number.isFinite(maxSerial) && maxSerial > 0 ? maxSerial : 0;
}

async function ensureStudentCounterSeeded() {
  const existing = await SequenceCounter.findById(STUDENT_COUNTER_KEY)
    .select("_id")
    .lean();
  if (existing) return;

  const maxSerial = await getCurrentMaxStudentSerial();

  // If two requests hit this concurrently, setOnInsert keeps seed atomic.
  await SequenceCounter.updateOne(
    { _id: STUDENT_COUNTER_KEY },
    { $setOnInsert: { value: maxSerial } },
    { upsert: true },
  );
}

async function syncStudentCounterToExistingMax() {
  const maxSerial = await getCurrentMaxStudentSerial();
  await SequenceCounter.updateOne(
    { _id: STUDENT_COUNTER_KEY },
    { $max: { value: maxSerial } },
    { upsert: true },
  );
}

export async function getNextStudentSerial() {
  await ensureStudentCounterSeeded();
  await syncStudentCounterToExistingMax();

  const counter = await SequenceCounter.findByIdAndUpdate(
    STUDENT_COUNTER_KEY,
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  )
    .select("value")
    .lean();

  return Number(counter?.value || 1);
}

export default { getNextStudentSerial };
