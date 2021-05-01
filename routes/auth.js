const { response } = require('express');
var express = require('express')
var router = express.Router()
const { check, validationResult } = require('express-validator');
const {signout, signup, signin, isSignedIn, verify, updatePasswordLink, forgotPassword} = require("../controllers/auth");




router.post("/signup",[
    check("name", "name should be at least 3 character").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be atleast 3 character").isLength({min: 3})
], signup);
//router.get("/signup", signup);

router.get("/verify/:uniqueString",verify)

router.post("/signin",[
    check("email", "email is required").isEmail(),
    check("password", "password is required").isLength({min: 3})
], signin);
//router.get("/signin", signin);

router.get("/signout", isSignedIn, (req,res) => {
    res.json(req.auth);
},signout);

router.post("/user/forgotpassword",updatePasswordLink);
router.put("/user/forgotpassword/:userId/:uniqueString",forgotPassword);

module.exports = router;