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

  if (typeof file.path === "string") {
    const normalizedPath = file.path.replace(/\\/g, "/");
    const marker = "/uploads/";
    const markerIndex = normalizedPath.toLowerCase().indexOf(marker);
    if (markerIndex >= 0) {
      return normalizedPath.slice(markerIndex).replace(/\/+/g, "/");
    }
  }

  if (typeof file.destination === "string" && typeof file.filename === "string") {
    const normalizedDestination = file.destination.replace(/\\/g, "/");
    const marker = "/uploads/";
    const markerIndex = normalizedDestination.toLowerCase().indexOf(marker);
    if (markerIndex >= 0) {
      const relativeDir = normalizedDestination.slice(markerIndex + marker.length).replace(/^\/+|\/+$/g, "");
      return `/uploads/${relativeDir}/${file.filename}`.replace(/\/+/g, "/");
    }
  }

  return "";
}

export default { getUploadedFileUrl };
