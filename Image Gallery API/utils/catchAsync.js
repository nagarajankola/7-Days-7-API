module.exports = (fn) => {
  return (req, res, next) => {
    // console.log(next)
    fn(req, res, next).catch(next);
  };
};
