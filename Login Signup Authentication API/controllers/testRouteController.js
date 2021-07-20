exports.testRoute = async (req, res, next) => {
  try {
    res.status(201).json({
      status: "success",
      message: "admin/users"
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

exports.testRouteSadmin = async (req, res, next) => {
  try {
    res.status(201).json({
      status: "success",
      message: "super admin"
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};
