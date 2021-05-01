const express = require("express")
const router = express.Router();

const {isSignedIn, isAuthenticated, isAdmin} =require("../controllers/auth");
const {getUserById, pushOrderInPurchaseList, getUser} =require("../controllers/user");

const {getOrderById, createOrder, getAllOrders,getOrderStatus,updateStatus, getOrder, getUserOrder} = require("../controllers/order");

const {updateStock} = require("../controllers/product");

//params
router.param("userId", getUserById);
router.param("orderId", getOrderById)


//actual routes

//create
router.post("/order/create/:userId", isSignedIn, isAuthenticated, pushOrderInPurchaseList, updateStock, createOrder)

//read
router.get("/order/all/:userId", isSignedIn, isAuthenticated, isAdmin, getAllOrders);
router.get("/order/:orderId", getOrder);
router.get("/user/order/:userId", isSignedIn, isAuthenticated,getUserOrder);


//status of order
router.get("order/status/:userId", isAdmin, isAuthenticated, isAdmin, getOrderStatus)
router.put("/order/:orderId/status/:userId", isSignedIn, isAuthenticated, isAdmin, updateStatus);

module.exports = router;

