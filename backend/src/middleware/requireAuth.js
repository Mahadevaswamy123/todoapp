import jwt from 'jsonwebtoken';

export default function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== 'object' || !payload.sub) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please log in again.' });
  }
}
