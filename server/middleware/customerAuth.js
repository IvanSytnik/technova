const jwt = require('jsonwebtoken');

const CUSTOMER_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET + '_customer';

module.exports = (req, res, next) => {
  // Check Authorization header first, then cookie
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.customer_token) {
    token = req.cookies.customer_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, CUSTOMER_SECRET);
    if (decoded.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.customer = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports.CUSTOMER_SECRET = CUSTOMER_SECRET;
module.exports.signToken = (payload) =>
  jwt.sign({ ...payload, role: 'customer' }, CUSTOMER_SECRET, { expiresIn: '7d' });
