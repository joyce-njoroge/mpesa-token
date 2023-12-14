const express = require("express");

const app = express();
require("dotenv").config()
const cors = require("cors");
const axios = require("axios")
const port = process.env.PORT;
//const TokenRoute = require("./route");

app.listen(port, () => {
console.log(`server run nicely at localhost:${port}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Mpesa programming in progress,Time to get paid nigga!");
});

// const corsOptions = {
//   origin: "http://localhost:3001", 
// };

// app.post("/",createToken,postStk) 
// app.post("/token", (req, res) => {
//     createToken()
// })

// app.post("/callback", (req, res) => {
//   const callbackData = req.body;
//   console.log(callbackData.Body);
//   if (!callbackData.Body.stkCallback.CallbackMetadata) {
//     console.log(callbackData.Body);
//     return res.json("okay");
//   }

//   console.log(callbackData.Body.stkCallback.CallbackMetadata);
// });

// app.use("/token", TokenRoute);

const generateToken = async (req, res, next) => {
    const secret = "VanOOD5f4yDnXviD";
    const consumer = "puf1WlUoy8prjmxN7G4WXqxTIlqA4xH0";
    const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
    await axios
      .get(
        "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          headers: {
            authorization: `Basic ${auth}`,
          },
        }
      )
      .then((data) => {
        token = data.data.access_token;
        console.log(data.data);
        next();
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err.message);
      });
  }
  

//middleware function to generate token
  app.post("/stk", generateToken, async (req, res) => {
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  
  const shortCode = 6537605; 
  const passkey ="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

  const password = new Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  await axios.post(
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortCode,
        PhoneNumber: `254${phone}`,
        CallBackURL: "https://mydomain.com/path",
        AccountReference: "Testing you",
        TransactionDesc: "Testing stk push",  
    },
    {
        headers: {
            Authorization: `Bearer $(token)`,
        },
    }
  ).then((data) =>{
    console.log(data)
    res.status(200).json(data)
  })
  .catch((err)=>{
    console.log(err.message)
    res.status(400).json(err.message)
  })
  });