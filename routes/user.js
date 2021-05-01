const express = require("express");
const router = express.Router();


const {getUserById, getUser, updateUserPassword, userPurchaseList} = require("../controllers/user");
const {isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth");
const {getUsers} = require("../controllers/user");
const { update } = require("../models/user");


router.param("userId", getUserById);

router.get("/user/:userId",isSignedIn, isAuthenticated, getUser);
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUserPassword);
router.get("/orders/user/:userId", isSignedIn, isAuthenticated, userPurchaseList);

module.exports = router;

