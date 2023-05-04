// const jwt = require('jsonwebtoken');
import jwt from "jsonwebtoken"

const verifyToken = (req, res, next) => {

  try {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({ message: 'Authentication Failed' });
    } else {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET, (err, result) => {
        if (err) {
          res.status(401).json({ message: 'Authentication Failed' });
        }
        if (result) {
          req.user = result.user;
          next();
        }
      });
    }

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Authentication Failed' });

  }
};
export default verifyToken