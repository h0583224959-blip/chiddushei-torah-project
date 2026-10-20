import Joi from 'joi';

const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) return next(error);
  req[property] = value;
  next();
};

const registerSchema = Joi.object({
  username: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).required().messages({
    'string.min': 'הסיסמה חייבת להכיל לפחות 8 תווים'
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const itemCreateSchema = Joi.object({
  title: Joi.string().trim().required(),
  author: Joi.string().trim().required(),
  description: Joi.string().allow('').optional(),
  file: Joi.object().unknown(true).required(),
});

const validateItemCreate = (req, res, next) => {
  req.body.file = req.file;
  validate(itemCreateSchema)(req, res, next);
};

const itemUpdateSchema = Joi.object({
  title: Joi.string().trim(),
  author: Joi.string().trim(),
  description: Joi.string().allow(''),
}).min(1);

const itemIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export { validate, validateItemCreate, registerSchema, loginSchema, itemUpdateSchema, itemIdSchema };