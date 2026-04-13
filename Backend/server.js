require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./Libs/db");
const router = require("./Routes/Router");
const bannerRouter = require("./Routes/Banner/RouterBanner");
const authRouter = require("./auth/RouterAuth");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", router);
app.use("/api/banner", bannerRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Server běží správně! 🚀");
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server běží na http://localhost:3000`),
);
