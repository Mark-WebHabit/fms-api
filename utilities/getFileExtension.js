const getFileExtension = (filename) => {
  const parts = filename.split(".");
  return parts[parts.length - 1];
};

const getFileType = (ext) => {
  if (ext === "txt") {
    return "text/plain";
  } else if (ext === "md") {
    return "text/markdown";
  } else if (ext === "csv") {
    return "text/csv";
  } else if (ext === "json") {
    return "application/json";
  } else if (ext === "html") {
    return "text/html";
  }
};

export { getFileExtension, getFileType };
