export function getUploadedFileUrl(file) {
  if (!file) return "";

  if (typeof file.path === "string" && /^https?:\/\//i.test(file.path)) {
    return file.path;
  }

  if (typeof file.secure_url === "string" && /^https?:\/\//i.test(file.secure_url)) {
    return file.secure_url;
  }

  if (typeof file.url === "string" && /^https?:\/\//i.test(file.url)) {
    return file.url;
  }

  return "";
}

export default { getUploadedFileUrl };
