import Joi from "joi";

async function usersValidation(req, res, next) {
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
      if (req.path === "/users" || req.path === "/users/") {
        return Joi.object({
          firstname: Joi.string(),
          lastname: Joi.string(),
          isVerified: Joi.bool(),
          emailId: Joi.string(),
          restaurant: Joi.string(),
          username: Joi.string(),
          role: Joi.string(),
        });
      } else {
        return Joi.object({
          id: Joi.string().required(),
          hashedString: Joi.string().required(),
        });
      }
    }
    case "POST": {
      return Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        password: Joi.string().required(),
        isAdmin: Joi.bool(),
        role: Joi.string().required(),
        emailId: Joi.string().email(),
        username: Joi.string(),
        restaurant: Joi.string(),
      });
    }
    case "PATCH": {
      if (req.path.includes("owner")) {
        return Joi.object({
          firstname: Joi.string(),
          lastname: Joi.string(),
          password: Joi.string(),
        });
      } else if (req.path.includes("user")) {
        return Joi.object({
          firstname: Joi.string(),
          lastname: Joi.string(),
          password: Joi.string(),
          role: Joi.string(),
          isAdmin: Joi.boolean(),
        });
      }
    }
  }
}

export default usersValidation;
