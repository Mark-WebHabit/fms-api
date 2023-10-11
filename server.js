import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { CorsOptions } from "./config/corsOptions.js";
import cookieParser from "cookie-parser";

// route paths
import userRoutes from "./routes/user.js";
import fileRoutes from "./routes/files.js";
import folderRoutes from "./routes/folder.js";

// custom middleware
import errorCatcher from "./middlewares/errorHandler.js";
import { verifyJWT } from "./middlewares/verifyJwt.js";
import verifyRoles from "./middlewares/verifyRoles.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());
app.use(cors(CorsOptions));

// middleware for user input datas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/user", userRoutes);

// protected / private
app.use(verifyJWT);
app.use(verifyRoles);
app.use("/api", fileRoutes);
app.use("/api", folderRoutes);

// catch all the errors
app.use(errorCatcher);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running in http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });
