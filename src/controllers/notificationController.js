const notificationController = {
  async callWaiter(req, res) {
    try {
      const io = req.app.locals.io;
      const restaurantId = req.params.restaurantId;
      const tableNo = req.params.tableNo;
      io.emit(`${restaurantId}WaiterCalled`, { tableNo });
      res.status(200).json({
        success: true,
        data: "Notified Restaurant",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async payByCash(req, res) {
    try {
      const io = req.app.locals.io;
      const restaurantId = req.params.restaurantId;
      const tableNo = req.params.tableNo;
      io.emit(`${restaurantId}ReceivePayment`, { tableNo });
      res.status(200).json({
        success: true,
        data: "Notified Restaurant",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

export default notificationController;
