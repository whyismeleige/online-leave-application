const { verifyToken } = require("../utils/auth.utils");
const User = require("../models").user;

const clearCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

exports.authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).send({
      message: "Unauthorized Access",
      type: "error",
    });
  }

  try {
    const payload = verifyToken(token);

    if (!payload) {
      clearCookie(res);
      return res.status(401).send({
        message: "Unauthorized Access",
        type: "error",
      });
    }

    const { id } = payload;

    const user = await User.findById(id);

    if (!user) {
      clearCookie(res);
      return res.status(400).send({
        message: "User Not Found",
        type: "error",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    clearCookie(res);
    console.error("The error is:", error);
    return res.status(403).send({
        
      message: "Unauthorized Access",
      type: "error",
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      clearCookie(res);
      return res.status(403).send({
        message: "Access Forbidden",
        type: "error",
      });
    }
    next();
  };
};
