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
    if (Array.isArray(dishes) && dishes.length > 0) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include at least one dish`,
    });
}


function statusPropertyIsValid(req, res, next) {
    const { data: { status } = {} } = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (validStatus.includes(status)) {
      return next();
    }
    next({
      status: 400,
      message: `Value of the 'status' property must be one of ${validStatus}. Received: ${status}`,
    });
  }
  function dishesQuantityPropertyIsValid(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    for (let [index, dish] of dishes.entries()) {
        if (!dish.quantity || !Number.isInteger(dish.quantity)){
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next();
}

function create(req,res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
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
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `order id not found: ${orderId}`,
    });
  };

function idsMatch(req, res, next) {
    const { orderId } = req.params;
    const order = res.locals.order;
    if (req.body.data.id) {
        if(req.body.data.id !== orderId) {
            return next({
                status: 400,
                message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orderId}`
            })
        }
    }
    return next();
}

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

function destroy(req, res, next) {
    const { orderId } = req.params;
    const order = orders.find((order) => order.id === orderId);
    if (order.status !== "pending") {
        next({
            status: 400,
            message: 'can only delete order if pending'
        });
    }
    const index = orders.findIndex((order) => order.id === orderId);
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
        orderExists,
        idsMatch,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        statusPropertyIsValid,
        dishesPropertyIsValid,
        dishesQuantityPropertyIsValid,
        update
    ],
    delete: [orderExists, destroy],
};