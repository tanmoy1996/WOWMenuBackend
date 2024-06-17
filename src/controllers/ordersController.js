import { Orders } from "../models";

const ordersController = {
  async getOrders(req, res) {
    try {
      let orders;
      req.query.restaurant = req.user.restaurant;
      if (req.query.limit) {
        const { page, limit } = req.query;
        orders = await Orders.find(req.query)
          .sort({ status: -1 })
          .populate([
            {
              path: "iterations",
              populate: {
                path: "items",
                populate: {
                  path: "item",
                  model: "MenuItem",
                  select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
                },
              },
            },
            {
              path: "acceptedBy",
              model: "Users",
              select: { _id: 1, firstname: 1, lastname: 1 },
            },
          ])
          .limit(limit)
          .skip((page - 1) * limit);
      } else {
        orders = await Orders.find(req.query)
          .sort({ status: -1 })
          .populate([
            {
              path: "iterations",
              populate: {
                path: "items",
                populate: {
                  path: "item",
                  model: "MenuItem",
                  select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
                },
              },
            },
            {
              path: "acceptedBy",
              model: "Users",
              select: { _id: 1, firstname: 1, lastname: 1 },
            },
          ]);
      }

      res.status(200).json({ status: true, data: orders });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async getOrderById(req, res) {
    try {
      const id = req.params.id;
      const order = await Orders.findById(id).populate([
        {
          path: "iterations",
          populate: {
            path: "items",
            populate: {
              path: "item",
              model: "MenuItem",
              select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
            },
          },
        },
        {
          path: "acceptedBy",
          model: "Users",
          select: { _id: 1, firstname: 1, lastname: 1 },
        },
      ]);
      if (!order)
        return res.status(404).json({
          success: false,
          error: { message: "Order Not Found" },
        });
      if (order.acceptedBy) {
        order.acceptedBy.password = undefined;
      }
      res.status(200).json({ status: true, data: order });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async postOrder(req, res) {
    try {
      const newOrder = new Orders({
        iterations: [
          {
            items: req.body.items,
            instruction: req.body.instruction,
          },
        ],
        tableNo: req.body.tableNo,
        restaurant: req.body.restaurant,
      });
      const savedOrder = await newOrder.save().then((odr) =>
        odr.populate([
          {
            path: "iterations",
            populate: {
              path: "items",
              populate: {
                path: "item",
                model: "MenuItem",
                select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
              },
            },
          },
          {
            path: "acceptedBy",
            model: "Users",
            select: { _id: 1, firstname: 1, lastname: 1 },
          },
        ]),
      );
      const io = req.app.locals.io;
      io.emit(`${savedOrder.restaurant}`, savedOrder); //emit to everyone
      return res.status(201).json({
        message: "Order saved successfully",
        status: true,
        data: savedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async addToOrder(req, res) {
    try {
      const order = await Orders.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: { message: "Order Not Found" },
        });
      }
      order.iterations.push({
        items: req.body.items,
        instruction: req.body.instruction,
      });
      order.status = "Pending";
      const savedOrder = await order.save().then((odr) =>
        odr.populate([
          {
            path: "iterations",
            populate: {
              path: "items",
              populate: {
                path: "item",
                model: "MenuItem",
                select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
              },
            },
          },
          {
            path: "acceptedBy",
            model: "Users",
            select: { _id: 1, firstname: 1, lastname: 1 },
          },
        ]),
      );
      const io = req.app.locals.io;
      io.emit(`${savedOrder.restaurant}`, savedOrder); //emit to everyone
      return res.status(201).json({
        message: "Order Updated successfully",
        status: true,
        data: savedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async updateOrder(req, res) {
    try {
      const order = await Orders.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: { message: "Order Not Found" },
        });
      }
      Object.assign(order, req.body);
      const savedOrder = await order.save();
      return res.status(201).json({
        message: "Order Updated successfully",
        status: true,
        data: savedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async acceptAll(req, res) {
    try {
      const data = req.body;
      if (!data) {
        return res.status(400).json({ success: false, error: "Missing data" });
      }
      const order = await Orders.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: { message: "Order Not Found" },
        });
      }
      const newIteration = order.iterations.map((iteration) => {
        return {
          ...iteration,
          status:
            iteration.status === "Pending" ? "Preparing" : iteration.status,
        };
      });
      Object.assign(order, { iterations: newIteration });
      order.status = "In progress";
      order.acceptedBy = req.user._id;
      const savedOrder = await order.save().then((odr) =>
        odr.populate([
          {
            path: "iterations",
            populate: {
              path: "items",
              populate: {
                path: "item",
                model: "MenuItem",
                select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
              },
            },
          },
          {
            path: "acceptedBy",
            model: "Users",
            select: { _id: 1, firstname: 1, lastname: 1 },
          },
        ]),
      );
      const io = req.app.locals.io;
      io.emit(`${savedOrder.id}`, savedOrder); //emit to everyone
      io.emit(`${savedOrder.restaurant}`, savedOrder); //emit to everyone
      return res.status(201).json({
        message: "Order Updated successfully",
        status: true,
        data: savedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async completeAll(req, res) {
    try {
      const order = await Orders.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: { message: "Order Not Found" },
        });
      }
      const newIteration = order.iterations.map((iteration) => {
        return {
          ...iteration,
          status:
            iteration.status === "Preparing" ? "Completed" : iteration.status,
        };
      });
      Object.assign(order, { iterations: newIteration });
      order.status = "Complete";
      const savedOrder = await order.save().then((odr) =>
        odr.populate([
          {
            path: "iterations",
            populate: {
              path: "items",
              populate: {
                path: "item",
                model: "MenuItem",
                select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
              },
            },
          },
          {
            path: "acceptedBy",
            model: "Users",
            select: { _id: 1, firstname: 1, lastname: 1 },
          },
        ]),
      );
      const io = req.app.locals.io;
      io.emit(`${savedOrder.id}`, savedOrder); //emit to everyone
      io.emit(`${savedOrder.restaurant}`, savedOrder); //emit to everyone
      return res.status(201).json({
        message: "Order Updated successfully",
        status: true,
        data: savedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async updateIteration(req, res) {
    const orderId = req.params.orderId;
    const iterationId = req.params.iterationId;
    const data = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: "Missing data" });
    }
    try {
      const order = await Orders.findById(orderId);
      if (!order) {
        return res
          .status(400)
          .json({ success: false, error: "Incorrect Order Id" });
      }
      var iteration = await order.iterations.id(iterationId);
      if (!iteration) {
        return res
          .status(400)
          .json({ success: false, error: "Incorrect Iteration Id" });
      }
      Object.assign(iteration, data);
      const isPending = order.iterations.filter(
        (iteration) => iteration.status === "Pending",
      );
      if (isPending.length === 0) order.status = "In progress";
      const isPreparing = order.iterations.filter(
        (iteration) => iteration.status === "Preparing",
      );
      if (isPreparing.length === 0) order.status = "Complete";
      if (req.body.status !== "Completed") order.acceptedBy = req.user._id;
      const savedOrder = await order.save().then((odr) =>
        odr.populate([
          {
            path: "iterations",
            populate: {
              path: "items",
              populate: {
                path: "item",
                model: "MenuItem",
                select: { _id: 1, name: 1, price: 1, imageUrl: 1 },
              },
            },
          },
          {
            path: "acceptedBy",
            model: "Users",
            select: { _id: 1, firstname: 1, lastname: 1 },
          },
        ]),
      );
      const io = req.app.locals.io;
      io.emit(`${savedOrder.id}`, savedOrder); //emit to everyone
      io.emit(`${savedOrder.restaurant}`, savedOrder); //emit to everyone
      return res.status(201).json({
        message: "Order Iteration updated successfully",
        status: true,
        data: savedOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async deleteOrder(req, res) {
    try {
      const id = req.params.id;
      const order = await Orders.findByIdAndDelete(id);
      res.status(200).json({
        message: `Order deleted successfully`,
        status: true,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

export default ordersController;
