require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { swaggerUi, specs } = require("./docs/swagger");

const userRouter = require("./routes/users.router");
const postRouter = require("./routes/posts.router");
const commentRouter = require("./routes/comments.router");
const leagueRouter = require("./routes/leagues.router");
const seasonRouter = require("./routes/seasons.router");
const clubRouter = require("./routes/clubs.router");
const playerRouter = require("./routes/players.router");
const careerRouter = require("./routes/careers.router");
const matchRouter = require("./routes/matches.router");
const postRelationRouter = require("./routes/postRelations.router");
const tagsRouter = require("./routes/tags.router");

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


userRouter.setup(app);
postRouter.setup(app);
commentRouter.setup(app);
leagueRouter.setup(app);
seasonRouter.setup(app);
clubRouter.setup(app);
playerRouter.setup(app);
careerRouter.setup(app);
matchRouter.setup(app);
postRelationRouter.setup(app);
tagsRouter.setup(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});