export const GALLERY_CATEGORIES = {
  WORKSHOPS_SEMINARS: "WORKSHOPS_SEMINARS",
  HANDS_ON_COLLEGE_TRAINING: "HANDS_ON_COLLEGE_TRAINING",
  EVENTS: "EVENTS",
};

export const GALLERY_CATEGORY_OPTIONS = [
  { value: GALLERY_CATEGORIES.WORKSHOPS_SEMINARS, label: "Workshops & Seminars" },
  { value: GALLERY_CATEGORIES.HANDS_ON_COLLEGE_TRAINING, label: "Hands-On Training in College" },
  { value: GALLERY_CATEGORIES.EVENTS, label: "Events" },
];

export const getGalleryCategoryLabel = (value) =>
  GALLERY_CATEGORY_OPTIONS.find((item) => item.value === value)?.label || "Other";
