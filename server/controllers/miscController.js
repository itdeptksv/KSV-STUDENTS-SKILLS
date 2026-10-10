const { Announcement, Notification, ParentStudentLink, AppSettings } = require('../models/Misc');
const Student = require('../models/Student');
const { ok, created, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// Announcements
exports.listAnnouncements = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (!req.user) filter.isPublic = true;
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 }).limit(20);
    ok(res, announcements);
  } catch (err) { next(err); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user._id });
    created(res, ann);
  } catch (err) { next(err); }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    ok(res, ann);
  } catch (err) { next(err); }
};

// Notifications
exports.myNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { recipient: req.user._id };
    if (req.query.unread === 'true') filter.isRead = false;
    const [notifs, total] = await Promise.all([
      Notification.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Notification.countDocuments(filter),
    ]);
    paginated(res, notifs, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    ok(res, null, 'Notifications marked as read');
  } catch (err) { next(err); }
};

// Parent-Student Links
exports.linkChild = async (req, res, next) => {
  try {
    const { studentId, relation } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const link = await ParentStudentLink.create({
      parent: req.user._id, student: studentId, relation,
      verifiedBy: req.user.role === 'admin' ? req.user._id : undefined,
    });
    created(res, link, 'Child linked');
  } catch (err) { next(err); }
};

exports.adminLinkChild = async (req, res, next) => {
  try {
    const { parentId, studentId, relation } = req.body;
    const link = await ParentStudentLink.findOneAndUpdate(
      { parent: parentId, student: studentId },
      { parent: parentId, student: studentId, relation, verifiedBy: req.user._id, isActive: true },
      { upsert: true, new: true }
    );
    ok(res, link, 'Link created/updated');
  } catch (err) { next(err); }
};

exports.myChildren = async (req, res, next) => {
  try {
    const links = await ParentStudentLink.find({ parent: req.user._id, isActive: true })
      .populate({ path: 'student', populate: { path: 'class', select: 'name' } });
    ok(res, links.map((l) => l.student));
  } catch (err) { next(err); }
};

// App Settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await AppSettings.find();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    ok(res, map);
  } catch (err) { next(err); }
};

exports.setSetting = async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    const setting = await AppSettings.findOneAndUpdate(
      { key },
      { key, value, description, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    ok(res, setting);
  } catch (err) { next(err); }
};
