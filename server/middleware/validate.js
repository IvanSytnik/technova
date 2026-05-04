const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Invalid email'),
  customer_phone: z.string().min(10, 'Invalid phone'),
  items: z.array(z.object({
    id: z.number(),
    price: z.number().positive(),
    qty: z.number().positive().int(),
  })).min(1, 'Cart is empty'),
  total: z.number().positive(),
});

const productSchema = z.object({
  name_ua: z.string().min(2).max(200),
  name_en: z.string().min(2).max(200),
  category: z.string().min(1),
  price: z.coerce.number().positive().int(),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ error: errors[0]?.message || 'Validation failed', errors });
  }
  req.validated = result.data;
  next();
};

module.exports = { registerSchema, loginSchema, orderSchema, productSchema, validate };
