import express, { Application } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import boom from "express-boom";
import swaggerUi from "swagger-ui-express";
import Router from "./routes";
import passport from "passport";
import cors from "cors";
import { config } from "./config/config";
import { ConfigPassport } from "./services/passport";
import fileUpload from "express-fileupload";
import expressSession from 'express-session';
// import path from "path";

const app: Application = express();

// app.set('view engine', 'ejs');

app.use(cors())

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  expressSession({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj: any, cb) {
  cb(null, obj);
});

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({
  limit: '50mb', verify: (req: any, res, buf) => {
    req.rawBody = buf
  }
}));
app.use(boom());
app.use(morgan("tiny"));
app.use(passport.initialize());
app.use(express.static("public"));
app.use(fileUpload());

app.use(passport.session());

ConfigPassport(passport);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, { swaggerOptions: { url: "/swagger.json" } })
);
app.use("/api/v1", Router);
// app.get('/emails/:id', (req, res) => {
//   console.log(__dirname)
//   res.render(path.join(__dirname, `views/emails/${req.params.id}`))
// })

app.listen(config.port, () =>
  console.log(`Server up and running on port ${config.port} !`)
);
