require('dotenv').config();
const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cron = require("node-cron");
const { autoGeneratePayments } = require("./controllers/payment.controller");
//Setup database
const database = require("./config/database.config.js")
database.connect();

const routeApi = require("./routes/index.route.js");
const app = express();
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const port = process.env.PORT;
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true
  }));
  
// Cron job chạy vào ngày 1 mỗi tháng lúc 0h
cron.schedule("0 0 1 * *", () => {
  autoGeneratePayments();
});

routeApi(app);

app.listen(port, () => {
   console.log(`App is listening on port ${port}`)
})