function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!allowedRoles || allowedRoles.length === 0) return next();
    if (allowedRoles.includes(req.user.role)) return next();

    return res.status(403).json({ message: "Forbidden" });
  };
}

// keys are dot-paths on the request that may contain the authenticated user's id.
function authorizeSelfOrRole(
  allowedRoles = [],
  keys = ["params.customer_id", "body.customer_id", "query.customer_id"],
) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (allowedRoles.includes(req.user.role)) return next();

    for (const key of keys) {
      const value = key.split(".").reduce((current, part) => current?.[part], req);
      if (value != null && String(value) === String(req.user.id)) return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
}

module.exports = { authorize, authorizeSelfOrRole };
