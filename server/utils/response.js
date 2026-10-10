const ok = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Created') => ok(res, data, message, 201);

const paginated = (res, data, pagination, message = 'Success') =>
  res.status(200).json({ success: true, message, data, pagination });

module.exports = { ok, created, paginated };
