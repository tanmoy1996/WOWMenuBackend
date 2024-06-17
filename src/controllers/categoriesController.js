import { Categories, MenuItems } from "../models";
import {
  burstCache,
  getCachedData,
  getKey,
  isCached,
  storeDataInCache,
} from "../utils/cacheUtil";

const categoriesController = {
  async get(req, res, next) {
    try {
      let data;
      const key = await getKey(req);
      if (await isCached(req.query.restaurant, key)) {
        data = await getCachedData(req.query.restaurant, key);
      } else {
        data = await Categories.find(req.query);
        await storeDataInCache(req.query.restaurant, key, data);
      }
      res.status(200).json({ status: true, data: data });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await Categories.findById(req.params.id);
      res.status(200).json({ status: true, data: data });
    } catch (error) {
      return next(error);
    }
  },

  async post(req, res, next) {
    const data = new Categories({
      name: req.body.name,
      isActive: req.body.isActive,
      createdBy: req.user._id,
      restaurant: req.user.restaurant.id,
    });

    try {
      const result = await data.save();
      await burstCache(req.user.restaurant.id);
      res.status(201).json({
        message: "Category successfully added",
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

      req.body.createdBy = req.user._id;

      if (req.body.isActive !== undefined) {
        const categoryData = await Categories.findById(id);
        if (categoryData.length !== 0) {
          await updateMenuItemsStatus(categoryData, req.body, res);
        } else {
          next({ message: `Category with ${id} doesn't exists` });
        }
      }

      const result = await Categories.findByIdAndUpdate(id, req.body, options);
      await burstCache(req.user.restaurant.id);
      res.status(200).json({
        message: "Category successfully updated",
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
      const { category } = await Categories.findByIdAndDelete(id);
      await deleteMenuItems(id);
      await burstCache(req.user.restaurant.id);
      res.status(200).json({
        message: `Category ${category} successfully deleted`,
        status: true,
      });
    } catch (error) {
      return next(error);
    }
  },
};

const deleteMenuItems = async (category) => {
  MenuItems.find({ category }, (err, menuItemsData) => {
    menuItemsData.map(async (row) => {
      await MenuItems.findByIdAndDelete(row._id);
    });
  });
};

const updateMenuItemsStatus = (categoryData, requestBody, res) => {
  MenuItems.find({ category: categoryData.category }, (err, menuItemsData) => {
    menuItemsData.map((row) => {
      MenuItems.findByIdAndUpdate(
        row.id,
        { isActive: requestBody.isActive },
        { new: true },
        (error) => {
          if (error) {
            return res.status(500).json({
              message: `unable to update menu items isActive status`,
            });
          }
        },
      );
    });
  });
};

export default categoriesController;
