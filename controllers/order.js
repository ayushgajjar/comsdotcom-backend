const {Order, ProductCart} = require("../models/order");

exports.getOrderById = (req,res,next,id) =>{
    Order.findById(id).populate("products.product", "name price").exec((err,order) => {
        if(err){
            return res.status(400).json({
                error: "No order found"
            })
        }

        req.order = order;
        next();
    })
}


exports.createOrder = (req,res) => {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);

    order.save((err,order) => {
        if(err){
            return res.status.json({
                error: "Failed to save order in db"
            })
        }

        res.json(order)
    })
}

exports.getAllOrders = (req,res) => {
    Order.find().sort({"createdAt":1}).populate("user", "_id name email").exec((err,order) => {
        if(err){
            res.status(400).json({
                error: "No orders found"
            })
        }

        res.json(order)
    })
}

exports.getOrder = (req,res) =>{
    Order.find(req.order).populate("user", "_id name email").exec((err,order) => {
        if(err){
            res.status(400).json({
                error: "No orders found"
            })
        }

        res.json(order)
    })
    
    //return res.json(req.order.populate("user", "name"));
}


exports.getOrderStatus = (req,res) => {
    res.json(Order.schema.path("status").enumValues);
}

exports.updateStatus = (req,res) => {
    
    Order.update(
        {_id: req.order._id},
        {$set: {status: req.body.status}},
        (err,order) => {
            if(err){
                return res.status(400).json({
                    error: "Cannot update order status"
                })
            }
            res.json(order);
        }
    )
}


exports.getUserOrder = (req,res) => {
    const orders=[];
    Order.find().sort({"createdAt":1}).populate("user").exec((err,order) => {
        if(err){
            res.status(400).json({
                error: "No orders found"
            })
        }
        else
        {
            order.map((ord,index) => {                    
                
                if(JSON.stringify(ord.user._id)==JSON.stringify(req.profile._id))
                {
                    
                    orders.push(ord)
                }
            })   
        }
        res.json(orders)
    })
}