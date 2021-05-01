const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { sortBy } = require("lodash");

exports.getProductById = (req,res,next,id) =>{
    Product.findById(id)
    .populate("category")
    .exec((err,product) => {
        if(err)
        {
            return res.status(400).json({
                error: "Product not found"
            });
        }
        req.product = product;
        next();
    });
};

exports.createProduct = (req,res) => {
    let form =  new formidable.IncomingForm();
    form.keepExtensions = true;


    form.parse(req,(err,fields,file) => {
        if(err)
        {
            return res.status(400).json({
                error : "Problem with image"
            });
        }

        //destructure the fields
        const {name, description, price, category, stock} = fields;

        if(!name || !description || !price || !category || !stock){
            return res.status(400).json({
                error: "Please include all fields"
            })
        }


        let product = new Product(fields);


        //handle files here
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error : "File size too big"
                });
            }

            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type


        }

        //save DB
        product.save((err,product) => {
            if(err){
                return res.status(400).json({
                    error: "Saving product in db is failed"
                })
            }

            res.json(product)
        } )
    });
};

exports.getProduct= (req,res) =>{
    req.product.photo = undefined
    
    return res.json(req.product)
}

//middele ware
exports.photo = (req,res,next) => {
    if(req.product.photo.data){
        res.set("Content-Type", req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}

//delete Controller
exports.deleteProduct = (req,res) =>{
    let product = req.product;
    product.remove((err,deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: "Failed to delete the product"
            })
        }
        res.json({
            message: "Deletion was a success"
        })
    })
}

//update controller
exports.updateProduct = (req,res) =>{
    let form =  new formidable.IncomingForm();
    form.keepExtensions = true;


    form.parse(req,(err,fields,file) => {
        if(err)
        {
            return res.status(400).json({
                error : "Problem with image"
            });
        }

        //update product
        let product = req.product;
        product = _.extend(product,fields)

        //handle files here
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error : "File size too big"
                });
            }

            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type


        }

        //save DB
        product.save((err,product) => {
            if(err){
                return res.status(400).json({
                    error: "Uodate product in db is failed"
                })
            }

            res.json(product)
        } )
    });
}


//product listining
exports.getAllProducts = (req,res) =>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 256
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id"

    Product.find().select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
        if(err){
            return res.status(400).json({
                error: "No product found"
            })
        }

        res.json(products)
    })
}


exports.getAllUniqueCategories = (req,res) => {
    Product.distinct("category", {}, (err,category) => {
        if(err){
            return res.status(400).json({
                error: "No category found"
            })
        }
        res.json(category)
    })
}


//update stock based on purchase
exports.updateStock = (req,res,next) => {
    let myOperation = req.body.order.products.map(prod => {
        return {
            updateOne: {
                filter : {_id : prod._id},
                update : {$inc: {stock: -prod.count, sold: +prod.count}}
            }
        }
    })
    Product.bulkWrite(myOperation, {}, (err,products) => {
        if(err){
            return res.status(400).json({
                error: "Bulk operation failed"
            })
        }
        next()
    });
}

