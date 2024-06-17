import Joi from "joi";

async function restaurantsValidation(req, res, next) {
  const validationSchema = await getDataSchema(req, res);
  const userInput = req.method === "GET" ? req.query : req.body;
  const { error } = await validationSchema.validate(userInput);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
}

function getDataSchema(req, res) {
  switch (req.method) {
    case "GET": {
      return Joi.object({
        name: Joi.string(),
        phoneNumber: Joi.string(),
        gstNumber: Joi.string(),
        gstPercentage: Joi.number(),
        totalTables: Joi.number(),
      });
    }
    case "POST": {
      return Joi.object({
        name: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        address: Joi.object().required(),
        gstNumber: Joi.string().required(),
        gstPercentage: Joi.number().required(),
        totalTables: Joi.number().required(),
        createdBy: Joi.string().required(),
      });
    }
    case "PATCH": {
      return Joi.object({
        name: Joi.string(),
        phoneNumber: Joi.string(),
        address: Joi.object(),
        gstNumber: Joi.string(),
        gstPercentage: Joi.number(),
        totalTables: Joi.number(),
      });
    }
    default: {
      res.status(400).json({ message: "Invalid request method" });
    }
  }
}

export default restaurantsValidation;
