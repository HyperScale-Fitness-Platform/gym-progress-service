function auth(req, res, next) {
  // Trust user-* headers from the gateway; no re-verification needed.
  // These headers are only set by the gateway and inaccessible from outside the cluster.
  const userId = req.headers["user-id"];
  const userEmail = req.headers["user-email"];
  const userRole = req.headers["user-role"];

  if (!userId) {
    return res.status(401).json({ message: "User ID header is required" });
  }

  req.user = { id: userId, email: userEmail, role: userRole };
  next();
}

module.exports = auth;

// function auth(req, res, next) {
//   console.log("AUTH MIDDLEWARE REACHED");
//   console.log("METHOD:", req.method);
//   console.log("PATH:", req.originalUrl);
//   console.log("USER ID:", req.headers["user-id"]);
//   console.log("USER ROLE:", req.headers["user-role"]);

//   const userId = req.headers["user-id"];
//   const userEmail = req.headers["user-email"];
//   const userRole = req.headers["user-role"];

//   if (!userId) {
//     return res.status(401).json({
//       message: "User ID header is required",
//     });
//   }

//   req.user = {
//     id: userId,
//     email: userEmail,
//     role: userRole,
//   };

//   next();
// }

// module.exports = auth;