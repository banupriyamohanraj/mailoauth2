require("dotenv").config();
NODE_TLS_REJECT_UNAUTHORIZED='0'
const express = require("express");
const { MongoClient, ObjectId } = require('mongodb')
const cors= require("cors");
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
var jwt = require('jsonwebtoken')
const crypto = require('crypto');


const app= express();
const port = process.env.PORT || 9000

app.use(express.json());
app.use(cors());

//DB connection

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017'

//nodemailer
const transporter = nodemailer.createTransport({
    service:"gmail",
    port: 465,
    secure: true,  
    auth: {
      type: 'OAuth2',
      user: process.env.NODEMAILER_ACC,
      pass: process.env.NODEMAILER_PASS,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken:process.env.ACCESS_TOKEN,
      refreshToken: process.env.REFRESH_TOKEN
    }
    
  });

  transporter.set("oauth2_provision_cb", (user, renew, callback) => {
    let accessToken = userTokens[user];
    if (!accessToken) {
      return callback(new Error("Unknown user"));
    } else {
      return callback(null, accessToken);
    }
  });
  

const authorize = require('./authorize')


app.get("/",authorize,async(req,res)=>{
    try {
        let client = await MongoClient.connect(dbURL);
        let db = client.db("user");
        let data = await db.collection("logininfo").find().toArray();
        if (data) {
            res.status(200).json(data)
        } else {
            res.status(404).json({ message: "no data found" })
        }
        client.close();
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"})
    }
})


app.put("/forgetpassword", async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL);
        let db = await client.db('user');
        let data = await db.collection("logininfo").findOne({ email: req.body.email })
        if (data) {
           let id = data._id;
           console.log(id)
            console.log(data)
         
            crypto.randomBytes(32,(err,buffer)=>{
                if(err){
                    console.log(err)
                }else{
                    const token = buffer.toString("hex")
                    console.log(token)
                    req.body.resetToken = token
                 db.collection('logininfo').findOneAndUpdate({ _id:ObjectId(id)},{$set:{token :token}}) 
            //  db.collection('logininfo').update({ _id:ObjectID(id),resetToken : req.body.resetToken}) 
            var mailOptions = {
                from: process.env.NODEMAILER_ACC,
                to:  req.body.email,
                subject: "Password Reset Link",
                html: `You have requested to reset the password
                The new OTP is ${token}`,
                
            }
           

            
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("email sent " + info.response)
                }
               
            })
            res.status(200).json({message : "Email sent to user successfully"})
                }
            })
           
        } else {
            res.status(404).json({ message: "User not registered" })
        }
        // client.close();
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post("/login", async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL,{useNewUrlParser: true, useUnifiedTopology: true});
        let db = await client.db('user');
        let data = await db.collection("logininfo").findOne({ email: req.body.email})
        if (data.status == 'Activated') {
            let isValid = await bcrypt.compare(req.body.password, data.password)
            // console.log(isValid)
            if (isValid) {
                let Auth_token = await jwt.sign({user_id:data._id},process.env.JWT_KEY)
                res.status(200).json({ message: "Login Sucessfull" ,Auth_token,data})
            }
            else {
                res.status(401).json({ message: "Invalid Credentials" })
            }
        }else if(data.status == 'pending') {
            res.status(401).json({message:"This account is not activated yet !! Please check your mail"})
        }
        else {
            res.status(404).json({ message: "User not registered" })
        }
        client.close();
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

app.post("/signup", async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL,{useNewUrlParser: true, useUnifiedTopology: true});
        let db = await client.db('user');
        let data = await db.collection("logininfo").findOne({ email: req.body.email, password: req.body.password })
        if (!data) {
            let salt = await bcrypt.genSalt(10)
            let hash = await bcrypt.hash(req.body.password, salt)
            req.body.password = hash
            console.log(req.body)
            crypto.randomBytes(32,(err,buffer)=>{
                if(err){
                    console.log(err)
                }else{
                    const confirmationcode = buffer.toString("hex")
                    console.log(confirmationcode)
                    req.body.code = confirmationcode
                  
                  db.collection('logininfo').insertOne(req.body)
            
            //  db.collection('logininfo').update({ _id:ObjectID(id),resetToken : req.body.resetToken}) 
            var mailOptions = {
                from: process.env.NODEMAILER_ACC,
                to:  req.body.email,
                subject: "Email Confirmation",
                html: `<h2>Hello</h2>
                <p>Thank you for subscribing. Please confirm your email with this OTP ${confirmationcode}</p>
                `
            }
           
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("email sent " + info.response)
                }
               
            })
            res.status(200).json({ message: "user successfully registered" })
                }
            })
           
        } else{
            res.send('user already exists')
        }

            
        }
        // client.close();
     catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })

    }

})

app.post('/newpassword',async (req,res)=>{
    try {
        const newpassword = req.body.password;
        const sentToken = req.body.token;
    
        let client = await MongoClient.connect(dbURL);
            let db = await client.db('user');
            let user_token = await db.collection("logininfo").findOne({ token : sentToken })
            if(!user_token){
                res.status(401).json({message : "Invalid Token"})
            }else{
                let salt = await bcrypt.genSalt(10)
                let hash = await bcrypt.hash(req.body.password,salt)
                req.body.password = hash
                await db.collection('logininfo').update({token:sentToken},{$set:{password:req.body.password, token : undefined}})
                res.status(200).json({ message: "Password Updated Successfully" })
            }
            client.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server error"})
    }
   
})

app.put('/confirm',async(req,res)=>{
    try {
        const confirmationcode = req.body.confirmationcode
        const status = req.body.status

        let client = await MongoClient.connect(dbURL);
        let db = await client.db('user');
    let activation =  await db.collection("logininfo").findOneAndUpdate({code : confirmationcode},{$set :{status : status,code:undefined} })
    if(activation){
        res.status(200).json({message:"Email activated"})
    }else{
        res.status(401).json({message : "Invalid activation code"})
    }
    client.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
})


app.post("/mailsend",async(req,res)=>{
    try {

        if(req.body.email){
            var mailOptions = {
                from: process.env.NODEMAILER_ACC,
                to:  req.body.email,
                subject: req.body.subject,
                html: req.body.mailContent,
                
            }
           
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("email sent " + info.response)
                }
               
            })
            res.status(200).json({message : "Email sent to user successfully"})
        }
        

        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server error"})
    }
})


app.listen(port,()=>console.log(`port runs with ${port}`));