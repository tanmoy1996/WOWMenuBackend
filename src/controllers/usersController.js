import { Restaurants, Users } from "../models";
import hashPasswordUtil from "../utils/hashPasswordUtil";

const usersController = {
  async get(req, res, next) {
    try {
      req.query.restaurant = req.user.restaurant._id;
      const data = await Users.find(req.query).select("-password");
      res.status(200).json({ status: true, data: data });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await Users.findById(req.params.id);
      res.status(200).json({ status: true, data: data });
    } catch (error) {
      return next(error);
    }
  },

  async post(req, res, next) {
    const {
      firstname,
      lastname,
      password,
      isAdmin,
      role,
      emailId,
      username,
      isVerified,
    } = req.body;

    const restaurant =
      role.toLowerCase() !== "owner" ? req.body.restaurant : null;

    const data = new Users({
      firstname,
      lastname,
      password,
      isAdmin,
      role,
      emailId,
      username,
      isVerified,
      restaurant,
      // createdBy: req.user._id,
    });

    try {
      let result = await data.save();
      if (role.toLowerCase() === "owner") {
        const restaurant = await createRestaurant(result.id);
        if (restaurant) {
          result = await Users.findByIdAndUpdate(
            result.id,
            { restaurant: restaurant.id },
            { new: true },
          );
          result.restaurant = restaurant;
        } else {
          await Users.findByIdAndDelete(result.id);
          return next({ message: "Unable to create the user" });
        }
      }
      result.password = undefined;
      res.status(201).json({
        message: "User successfully added",
        status: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const options = { new: true };

      if (typeof req.body.password !== "undefined") {
        req.body.password = await hashPasswordUtil(req.body.password);
      }

      req.body.createdBy = req.user._id;

      const result = await Users.findByIdAndUpdate(
        req.params.id,
        req.body,
        options,
      );
      result.password = undefined;
      const response = { userDetails: result };
      res.status(200).json({
        message: `User data is successfully updated`,
        status: true,
        data: response,
      });
    } catch (error) {
      return next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const { firstname, lastname } = await Users.findByIdAndDelete(id);
      res.status(200).json({
        message: `User ${firstname} ${lastname} is successfully deleted`,
        status: true,
      });
    } catch (error) {
      return next(error);
    }
  },
};

async function createRestaurant(userId) {
  const data = new Restaurants({
    createdBy: userId,
  });
  try {
    return await data.save();
  } catch (error) {
    return false;
  }
}

export default usersController;
