import { Restaurants, Users } from "../models";
import generateJWTToken from "../utils/generateJWTTokenUtil";

const restaurantsController = {
  async get(req, res, next) {
    try {
      const data = await Restaurants.find(req.query);
      res.status(200).json({ status: true, data: data });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await Restaurants.findById(req.params.id);
      res.status(200).json({ status: true, data: data });
    } catch (error) {
      return next(error);
    }
  },

  async post(req, res, next) {
    const data = new Restaurants({
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      gstNumber: req.body.gstNumber,
      gstPercentage: req.body.gstPercentage,
      totalTables: req.body.totalTables,
      createdBy: req.body.createdBy,
    });

    try {
      const result = await data.save();
      const user = await Users.findById(req.user._id);
      Object.assign(user, {
        restaurant: result.id,
      });
      await Users.findByIdAndUpdate(req.user._id, user, {
        new: true,
      });
      // await user.save();
      user["password"] = undefined;
      const accessToken = generateJWTToken(user, "access");
      const refreshToken = generateJWTToken(user, "refresh");
      res
        .status(201)
        .cookie("accessToken", `Bearer ${accessToken}`, {
          httponly: true,
          sameSite: "none",
          secure: true,
          maxAge: 1000 * 60 * 30,
        })
        .cookie("refreshToken", `Bearer ${refreshToken}`, {
          httponly: true,
          sameSite: "none",
          secure: true,
          maxAge: 1000 * 60 * 60 * 24,
        })
        .header("Access-Control-Allow-Credentials", true)
        .header("Origin-Allow-Credentials", true)
        .json({
          message: "Restaurant successfully added",
          status: true,
          data: result,
        });
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const id = req.params.id;

      const options = { new: true };

      const result = await Restaurants.findByIdAndUpdate(id, req.body, options);
      res.status(200).json({
        message: "Restaurant successfully updated",
        status: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const { name } = await Restaurants.findByIdAndDelete(id);
      res.status(200).json({
        message: `Restaurant ${name} successfully deleted`,
        status: true,
      });
    } catch (error) {
      return next(error);
    }
  },
};

export default restaurantsController;
