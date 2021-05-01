const User = require("../models/user");
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require("express-jwt");
require('dotenv').config()

const nodemailer=require('nodemailer');
const { response } = require("express");
const crypto = require('crypto');




const sendEmail = (email,subject,content) => {
    const Transport= nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.User,
            pass: process.env.password
        }
    })
    var mailOption;
    const sender = process.env.User;
    mailOption={
        to:email,
        from:sender,
        subject:subject,
        html:content
    };

    Transport.sendMail(mailOption,(err,response) => {
        if(err){
            console.log(err)
            
        }
        else{
            
            console.log("success");
        }
    })
}

exports.verify =  async (req,res) => {
    const {uniqueString} = req.params;

    const user = await User.findOne({uniqueString:uniqueString});
    if(user){
        user.isValid=true;
        await user.save();
        //res.json("you are successfuly verified");
        res.write('<html>');
        res.write('<head> <title> Password Verify </title> </head>');
        res.write(' <body> You are success fully verified your account. Please click link below to Login.<br>');
        res.write(` <a href=http://54.152.6.101:3000/signin> Login </a> </body>`)
        res.write('</html>');
        //write end to mark it as stop for node js response.
        res.end();

    }
    else{
        res.json("user not found")
    }
}

exports.signup = async(req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty())
    {
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }
    const {email}=req.body;
    const user = new User(req.body);
    User.findOne({email}, async(err, userr) =>{
        
        if(userr){
          
            //console.log(flag)
            return res.status(400).json({
                error: "You have alredy account in this email. Please go to login"
            })
            
        }
        else
        {
            user.uniqueString = crypto.randomBytes(64).toString('hex');
            user.isValid=false;
            await user.save();
            const subject="Email confirmation";
            const content=`
            <h1>Hello</h1>
            <p>Thanks for registering on Our Site.</p>
            <p>Please click link below to verify your account</p>
            <a href=http://54.152.6.101:8081/api/verify/${user.uniqueString}> Verify your Account </a>`
            sendEmail(email,subject,content);
            return res.json("Thanks for registering. Please Check your mail to verify account")
        }
    })
    
    
    
};



exports.signin = (req, res) => {
    const {email, password} = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty())
    {
        return res.status(422).json({
            error: errors.array()[0].msg
        });
    }

    User.findOne({email}, (err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: "User is not exsist"
            })
        }

        if(!user.autheticate(password)){
            return res.status(401).json({
                error: "Email and password not match"
            })
        }

        if(!user.isValid)
        {
            return res.status(401).json({
                error: "You not verify your account.Please Check your mail to verify your account"
            })
        }

        //tocken
        const token = jwt.sign({_id: user._id}, process.env.SECRET)

        //put tocken in cookie
        res.cookie("token", token, {expire: new Date() + 9999})

        // send response to frontend
        const {_id, name, email, role} = user;
        return res.json({token, user: {_id, name, email, role}})

    })
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "user signout"

    });
};


//protected routes
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
})


//custom middlewares
exports.isAuthenticated = (req, res, next) => {
    
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!checker){
        return res.status(403).json({
            error: "ACCESS DENIED"
        })
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if(req.profile.role == 0){
        return res.status(403).json({
            error: "You are not admin, access denied"
        });
    }
    next();
}

exports.updatePasswordLink = (req,res) => {
    const {email}=req.body;
    User.findOne({email}, async(err, user) =>{
        
        if(err || !user){
          
            //console.log(flag)
            return res.status(400).json({
                error: "User is not exsist"
            });
            
        }
        else
        {

            const subject="Forgot Password";
            const content=`
            <h1>Hello</h1>
            <p>Please click link below to Forgot your account</p>
            <a href=http://54.152.6.101:3000/forgotpassword/${user._id}/${user.uniqueString}> Change Your Password </a>`
            sendEmail(email,subject,content);

            
            return res.json("Verify Password Link is send to Your register email")                      
        }      

    })     
}

exports.forgotPassword = (req,res)=> {
    
    const {userId,uniqueString}=req.params;
    User.findOne({_id:userId}, (err, user) => {
        if(err || !user){
            console.log(err)
            return res.status(400).json({
                error: "User is "
            })
        }
        if(uniqueString==user.uniqueString)
        {
            User.updateOne(
                {_id:userId},
                {$set:{encry_password:user.securePassword(req.body.password)}},
                {new: true, useFindAndModify: false},
                (err, response) => {
    
                    if(err)
                    {
                        return res.status(400).json({
                            error: "You are not authorize to update this user"
                        })
                    }
                    return res.json("password success fully updated. Please go to login")
                    
                    
                }
            )
        }
        else{
            return res.status(400).json({
                error: "You are not authorize to update this user"
            })
        }
        
    })
    
}

