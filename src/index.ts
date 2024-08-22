import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from "./dbConfig/connection";
import leadRoutes from "./routes/leads/leadRoute";
import careerRoutes from "./routes/career/careerRoute";
import userRoutes from "./routes/users/usersRoute";
import meetingRoutes from "./routes/meeting/meetingRoute";
import supportRoutes from "./routes/support/supportRoute";
import blogRoutes from "./routes/blog/blogRoute";
import addonRoutes from "./routes/addOn/addOnRoute";
import jobPostRoutes from "./routes/jobPost/jobPostRoute";
import pricingRoutes from "./routes/pricing/pricingRoute";
import profileRoutes from "./routes/permission/pemissionRoute";
import cookieParser from "cookie-parser";
import path from "path";
dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://togile.com",
      "https://togile-web-dashbord-frontend.vercel.app",
    ],
  })
);
// app.use((req, res, next) => {
//   console.log("Cookies:", req.cookies);
//   next();
// });
app.get("/", async (req, res) => {
  res.json({ message: "test msg" });
});
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.use("/leads", leadRoutes);
app.use("/careers", careerRoutes);
app.use("/users", userRoutes);
app.use("/meetings", meetingRoutes);
app.use("/support", supportRoutes);
app.use("/blogs", blogRoutes);
app.use("/addons", addonRoutes);
app.use("/jobpost", jobPostRoutes);
app.use("/pricing", pricingRoutes);
app.use("/permission", profileRoutes);

app.listen(port, async () => {
  try {
    await dbConnection;
    console.log(`listening on http://localhost:${port}/`);
  } catch (error) {
    console.error("app.listen error:", error);
    console.log(`error while listening on ${port}`);
  }
});
