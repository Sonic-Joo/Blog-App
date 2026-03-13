const { setServers } = require("node:dns/promises");
setServers(["8.8.4.4", "8.8.8.8"]);

const mongoose = require("mongoose");
module.exports = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("DataBase Connected Successfully");
    })
    .catch((error) => {
      console.log("Connected Fail Because:", error.message);
    });
};
