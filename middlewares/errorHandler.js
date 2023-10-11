import path from "path";
import getDT from "../utilities/getDT.js";
import { promises as fsPromises } from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorCatcher = async (err, req, res, next) => {
  if (err) {
    const { message } = err; // Destructure message and stack properties
    const code = res.statusCode === 200 ? 500 : res.statusCode;

    const formattedErrorLog = `${getDT()}\t\t\t${code}\t\t\t${req.url}\t\t\t${
      req.headers.host
    }\t\t\t${req.method}\t\t\terror: ${message}\n `;

    const logDirectory = path.join(__dirname, "..", "Log");
    const errorLog = path.join(logDirectory, "errorLog.txt");

    try {
      // Create the log directory if it doesn't exist
      await fsPromises.mkdir(logDirectory, { recursive: true });

      // Append the error log to the file
      await fsPromises.appendFile(errorLog, formattedErrorLog);

      // Send the error response and do not return here
      res
        .status(res.statusCode)
        .json({ error: true, message: "Something went wrong" });
    } catch (error) {
      console.error("Error while logging:", error);
      // Send the error response and do not return here
      res.status(500).json({ error: true, message: "Internal server error" });
    }
  } else {
    next(); // Call next to continue processing middleware or route handlers
  }
};

export default errorCatcher;
