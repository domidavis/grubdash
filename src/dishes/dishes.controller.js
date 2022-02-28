const req = require("express/lib/request");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: dishes });
  }

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Must include a ${propertyName}` });
    };
  }
  
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId,
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}
function priceIsValidNumber(req, res, next){
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)){
        return next({
            status: 400,
            message: `Property must be a number: price`
        });
    }
    next();
  }
function namePropertyIsValid(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name) {
      return next();
    }
    next({
      status: 400,
      message: `Property required: name`,
    });
}

function descriptionPropertyIsValid(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description) {
      return next();
    }
    next({
      status: 400,
      message: `Property required: description`,
    });
}
function imagePropertyIsValid(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url) {
      return next();
    }
    next({
      status: 400,
      message: `Property required: image_url`,
    });
}
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === Number(dishId));
    if (foundDish) {
        return next();
    }
    next({
        status: 404,
    });
}

function read(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === Number(dishId));
    res.status(200).json({ data: foundDish });
  };

function update(req, res) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === Number(dishId));
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    // Update the paste
    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;
  
    res.json({ data: foundDish });
  
}
module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        create
    ],
    list,
    read: [dishExists, read],
    update: [
        namePropertyIsValid,
        descriptionPropertyIsValid,
        imagePropertyIsValid,
        priceIsValidNumber,
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        update
    ],
};