require('dotenv').config();
const app = require('./src/app');
const cron = require("node-cron");
const { importNews } = require("./src/modules/news/news.importer");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Optionally schedule cron jobs here
// cron.schedule("*/30 * * * *", importNews);
