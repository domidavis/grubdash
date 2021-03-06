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
        id: nextId(),
        name,
        description,
        price,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
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
function priceIsValidNumber(req, res, next){
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)){
        next({
            status: 400,
            message: `Property must be a number: price`
        });
    }
    return next();
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
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    });
}
function idsMatch(req, res, next) {
    const { dishId } = req.params;
    const dish = res.locals.dish;
    if (req.body.data.id) {
        if(req.body.data.id !== dishId) {
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${dishId}`
            })
        }
    }
    return next();
}


function read(req, res, next) {
    res.json({ data: res.locals.dish });
  };

function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    // Update the paste
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  
    res.json({ data: dish });
}

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        namePropertyIsValid,
        priceIsValidNumber,
        create
    ],
    list,
    read: [dishExists, read],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        namePropertyIsValid,
        descriptionPropertyIsValid,
        imagePropertyIsValid,
        priceIsValidNumber,
        idsMatch,
        update
    ],
};