const jwt = require('jsonwebtoken');
const { Patients } = require('../models');


exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded);

    const patient = await Patients.findByPk(decoded.id, {
      attributes: ['id', 'fullName', 'email' , 'password' , 'phone' , 'gender' , 'birthday'  , 'image'  ],
    });

    if (!patient) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.patient = patient;
    // console.log("Authenticated user:", req.user); 

    next();
  } catch (err) {
    // console.error("Token verification failed:", err.message); 
    return res.status(401).json({ error: 'Invalid token' });
  }
};
