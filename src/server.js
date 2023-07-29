import express from "express"
import configViewEngine from './configs/configViewEngine'
import initWebRoute from "./route/web"
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;

configViewEngine(app);
initWebRoute(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})