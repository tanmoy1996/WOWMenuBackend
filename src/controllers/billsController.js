import { Orders, Bills, Restaurants, Categories } from "../models";

const getUniqueItems = (order) => {
  const filterIterations = order.iterations.filter(
    (odr) => odr.status !== "Rejected",
  );
  const orderItems = filterIterations
    .map((odr) => {
      return odr.items;
    })
    .flat();
  const itemMaps = new Map();
  orderItems.forEach((item) => {
    const modifiedItem = {
      itemId: item.item.id,
      name: item.item.name,
      quantity: item.quantity,
      price: item.item.price,
    };
    if (!itemMaps.has(modifiedItem.itemId))
      itemMaps.set(modifiedItem.itemId, modifiedItem);
    else {
      const prevItem = itemMaps.get(modifiedItem.itemId);
      itemMaps.set(modifiedItem.itemId, {
        ...modifiedItem,
        quantity: parseInt(modifiedItem.quantity) + parseInt(prevItem.quantity),
      });
    }
  });
  return [...itemMaps.values()];
};

const billsController = {
  async getBills(req, res) {
    try {
      let bills;
      req.query.restaurant = req.user.restaurant;
      if (req.query.limit) {
        const { page, limit } = req.query;
        bills = await Bills.find(req.query)
          .limit(limit)
          .skip((page - 1) * limit);
      } else {
        bills = await Bills.find(req.query);
      }
      res.status(200).json({ status: true, data: bills });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async getBillById(req, res) {
    try {
      const id = req.params.id;
      const bill = await Bills.findById(id);
      if (!bill)
        return res.status(404).json({
          success: false,
          error: { message: "Bill Not Found" },
        });
      res.status(200).json({ status: true, data: bill });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async postBill(req, res) {
    try {
      const id = req.body.order;
      const order = await Orders.findById(id).populate([
        {
          path: "iterations",
          populate: {
            path: "items",
            populate: {
              path: "item",
              model: "MenuItem",
            },
          },
        },
        {
          path: "acceptedBy",
          model: "Users",
        },
      ]);
      if (!order)
        return res.status(404).json({
          success: false,
          error: { message: "Order Not Found" },
        });
      const restaurant = await Restaurants.findById(order.restaurant);
      if (!restaurant)
        return res.status(404).json({
          success: false,
          error: { message: "Restaurant Not Found" },
        });
      const bill = await Bills.find({ order: id });
      if (bill.length !== 0)
        return res.status(422).json({
          success: false,
          error: {
            message: "A Bill with same Order already exists",
          },
        });
      const items = getUniqueItems(order);
      const subtotal = parseFloat(
        items.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0),
      ).toFixed(2);
      const totalQty = parseInt(
        items.reduce((acc, curr) => {
          return acc + curr.quantity;
        }, 0),
      );
      const gst = parseFloat(
        (restaurant.gstPercentage * subtotal) / 100,
      ).toFixed(2);
      const totalAmt = parseFloat(Number(2 * gst) + Number(subtotal)).toFixed(
        2,
      );
      let manager = "";
      if (order.acceptedBy)
        manager = `${order.acceptedBy.firstname} ${order.acceptedBy.lastname}`;
      const newBill = new Bills({
        orderId: id,
        tableNo: order.tableNo,
        restaurant: order.restaurant,
        createdBy: manager,
        items: items,
        subtotal: subtotal,
        totalQuantity: totalQty,
        cgst: gst,
        sgst: gst,
        total: totalAmt,
      });
      const savedBill = await newBill.save();
      return res.status(201).json({
        message: "Bill saved successfully",
        status: true,
        data: savedBill,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async updateBill(req, res) {
    try {
      const bill = await Bills.findById(req.params.id);
      if (!bill) {
        return res.status(404).json({
          success: false,
          error: { message: "Bill Not Found" },
        });
      }
      Object.assign(bill, req.body);
      const savedBill = await bill.save();
      return res.status(201).json({
        message: "Bill Updated successfully",
        status: true,
        data: savedBill,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async deleteBill(req, res) {
    try {
      const id = req.params.id;
      const bill = await Bills.findByIdAndDelete(id);
      res.status(200).json({
        message: `Bill deleted successfully`,
        status: true,
        data: bill,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async getAnalytics(req, res) {
    try {
      req.query.restaurant = req.user.restaurant.id;
      const ordersCount = await Bills.find(req.query).count();
      const amounts = await Bills.find(req.query).select("total");
      const qty = await Bills.find(req.query).select("totalQuantity");
      const items = await Bills.find(req.query)
        .select("items")
        .populate({
          path: "items",
          populate: {
            path: "itemId",
            model: "MenuItem",
            select: { _id: 1, imageUrl: 1, category: 1 },
          },
        });
      const allItems = items
        .map((itms) => {
          return itms.items;
        })
        .flat();
      const itemMaps = new Map();
      allItems.map((item) => {
        const modifiedItem = {
          id: item.itemId.id,
          category: item.itemId.category,
          imageUrl: item.itemId.imageUrl,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        };
        if (!itemMaps.has(modifiedItem.name)) {
          itemMaps.set(modifiedItem.name, modifiedItem);
        } else {
          const prevItem = itemMaps.get(modifiedItem.name);
          itemMaps.set(modifiedItem.name, {
            ...modifiedItem,
            quantity:
              parseInt(modifiedItem.quantity) + parseInt(prevItem.quantity),
          });
        }
      });

      const categoryMap = new Map();
      allItems.map((item) => {
        const modifiedItem = {
          category: item.itemId.category,
          quantity: item.quantity,
        };
        if (!categoryMap.has(modifiedItem.category.toString())) {
          categoryMap.set(modifiedItem.category.toString(), modifiedItem);
        } else {
          const prevItem = categoryMap.get(modifiedItem.category.toString());
          categoryMap.set(modifiedItem.category.toString(), {
            ...modifiedItem,
            quantity:
              parseInt(modifiedItem.quantity) + parseInt(prevItem.quantity),
          });
        }
      });
      const categoryNames = await Categories.find({
        _id: { $in: [...categoryMap.keys()] },
      }).select("name");

      const totalQuantity = qty.reduce((acc, curr) => {
        return acc + curr.totalQuantity;
      }, 0);
      const totalRevenue = parseFloat(
        amounts.reduce((acc, curr) => {
          return acc + curr.total;
        }, 0),
      ).toFixed(2);
      const topItems = [...itemMaps.values()]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);
      const topCategories = [...categoryMap.values()]
        .map((cat) => {
          const catName = categoryNames.find(
            (cat2) => cat2.id.toString() === cat.category.toString(),
          );
          return {
            ...cat,
            ...{ name: catName.name },
          };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

      res.status(200).json({
        status: true,
        data: {
          totalRevenue,
          totalQuantity,
          ordersCount,
          topItems,
          topCategories,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

export default billsController;
