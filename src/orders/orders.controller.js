const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
    res.json({ data: orders });
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
function deliverToPropertyIsValid(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a deliverTo`,
    });
  }

function mobileNumberPropertyIsValid(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a mobileNumber`,
    });
}

function dishesPropertyIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes > 0) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
}

function dishesQuantityPropertyIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    for (let dish of dishes) {
        if (dish.quantity === 0 || isNaN(dish.quantity)){
            next({
                status: 400,
                message: `Dish ${dish.quantity} must have a quantity that is an integer greater than 0`
            })
        }
    }
    next();
}

function create(req,res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId,
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === Number(orderId));
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `order id not found: ${orderId}`,
    });
  };
  
function read(req, res, next) {
    res.json({ data: res.locals.order });
};

function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
  }

module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        dishesPropertyIsValid,
        dishesQuantityPropertyIsValid,
        create
    ],
    list,
    read: [orderExists, read],
    update: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        dishesPropertyIsValid,
        dishesQuantityPropertyIsValid,
        orderExists,
        update
    ],
    delete: [orderExists, destroy],
};