import Joi from "joi";

async function authValidations(req, res, next) {
  const validationSchema = await getDataSchema(req, res);
  const userInput = req.method === "GET" ? req.query : req.body;
  const { error } = await validationSchema.validate(userInput);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
}

function getDataSchema(req) {
  switch (req.method) {
    case "GET": {
      return Joi.object({
        id: Joi.string().required(),
        hashedString: Joi.string().required(),
      });
    }
    case "POST": {
      return Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
      });
    }
  }
}

export default authValidations;
