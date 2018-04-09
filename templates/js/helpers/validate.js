module.exports = function validate(ctx, status = 400) {
  if (ctx.errors && ctx.errors.length) {
    ctx.throw(status);
  }
};
