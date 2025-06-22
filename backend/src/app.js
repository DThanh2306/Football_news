require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { swaggerUi, specs } = require("./docs/swagger");

const userRouter = require("./routes/users.router");

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


userRouter.setup(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});