import fs from "fs";
import path from "path";

function removeDirectoryRecursively(directoryPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file) => {
        const filePath = path.join(directoryPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          removeDirectoryRecursively(filePath);
        } else {
          fs.unlinkSync(filePath); // Delete file
        }
      });
      fs.rmdirSync(directoryPath); // Delete the now empty directory
      resolve();
    } else {
      reject();
    }
  });
}

export default removeDirectoryRecursively;
