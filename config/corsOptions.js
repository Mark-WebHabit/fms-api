const whiteList = ["https://fms-e6rp.onrender.com"];

export const CorsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, //allow cookies
};
