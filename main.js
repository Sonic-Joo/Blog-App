require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());

const ConnectDB = require("./config/connectToDB");
ConnectDB();

const { apiLimiter, authLimiter } = require("./middleware/apiLimiter");
app.use("/api/auth", authLimiter, require("./routes/auth.route"));
app.use("/api/users", apiLimiter, require("./routes/user.route"));
app.use("/api/posts", apiLimiter, require("./routes/post.route"));
app.use("/api/comments", apiLimiter, require("./routes/comment.route"));
app.use("/api/categories", apiLimiter, require("./routes/category.route"));

const { errorHandler, notFound } = require("./middleware/error");
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is Listen on port:", PORT, "in", process.env.NODE_ENV);
});

app.disable("x-powered-by");
