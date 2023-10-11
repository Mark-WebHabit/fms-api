const verifyRoles = async (req, res, next) => {
  if (req.method === "GET") {
    return next();
  }
  const rolesArray = ["Admin"];

  if (!req?.role) return res.sendStatus(401); // no roles found

  if (!rolesArray.includes(req.role)) return res.sendStatus(401); // invalid role

  next();
};
export default verifyRoles;
