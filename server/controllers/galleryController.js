const { GalleryAlbum, GalleryItem } = require('../models/Gallery');
const Student = require('../models/Student');
const { ok, created, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const audit = require('../utils/audit');

exports.listAlbums = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (!req.user || req.user.role === 'parent' || req.user.role === 'student') filter.isPublic = true;
    if (req.query.skillArea) filter.skillArea = req.query.skillArea;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const [albums, total] = await Promise.all([
      GalleryAlbum.find(filter).populate('skillArea', 'name').populate('academicYear', 'label')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      GalleryAlbum.countDocuments(filter),
    ]);
    paginated(res, albums, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.createAlbum = async (req, res, next) => {
  try {
    const album = await GalleryAlbum.create({ ...req.body, createdBy: req.user._id });
    created(res, album);
  } catch (err) { next(err); }
};

exports.updateAlbum = async (req, res, next) => {
  try {
    const album = await GalleryAlbum.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    ok(res, album);
  } catch (err) { next(err); }
};

exports.listItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { album: req.params.albumId };
    const isPublicView = !req.user || ['student', 'parent'].includes(req.user?.role);
    if (isPublicView) filter.status = 'approved';
    if (req.query.type) filter.type = req.query.type;
    const [items, total] = await Promise.all([
      GalleryItem.find(filter)
        .populate('skillArea', 'name')
        .populate('taggedStudents', 'name')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      GalleryItem.countDocuments(filter),
    ]);
    // Strip student details for public
    const data = isPublicView
      ? items.map((item) => {
          const obj = item.toObject();
          if (obj.displayNameOnly) {
            obj.taggedStudents = obj.taggedStudents.map((s) => ({ name: s.name?.split(' ')[0] }));
          }
          return obj;
        })
      : items;
    paginated(res, data, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.submitItem = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const { title, caption, type, skillArea, taggedStudents, displayNameOnly, consentVerified, externalUrl } = req.body;
    if (!consentVerified || consentVerified === 'false')
      return res.status(400).json({ success: false, message: 'Consent must be verified before submission' });
    // Verify tagged students have consent
    if (taggedStudents?.length) {
      const students = await Student.find({ _id: { $in: taggedStudents } });
      const noConsent = students.filter((s) => !s.consentPublicGallery);
      if (noConsent.length)
        return res.status(400).json({ success: false, message: `Students without gallery consent: ${noConsent.map((s) => s.name).join(', ')}` });
    }
    const itemData = {
      album: albumId, title, caption, type, skillArea, taggedStudents,
      displayNameOnly: displayNameOnly !== false,
      consentVerified: true,
      status: 'pending',
      submittedBy: req.user._id,
    };
    if (req.file) {
      itemData.filename = req.file.filename;
      itemData.originalName = req.file.originalname;
      itemData.path = req.file.path;
    } else if (externalUrl) {
      itemData.externalUrl = externalUrl;
    }
    const item = await GalleryItem.create(itemData);
    created(res, item, 'Submitted for approval');
  } catch (err) { next(err); }
};

exports.approveItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    // Make album public if not already
    await GalleryAlbum.findByIdAndUpdate(item.album, { isPublic: true });
    await audit(req.user._id, 'APPROVE_GALLERY', 'GalleryItem', item._id, null, req.ip);
    ok(res, item, 'Item approved');
  } catch (err) { next(err); }
};

exports.rejectItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', approvedBy: req.user._id, approvedAt: new Date(), rejectionReason: req.body.reason },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    ok(res, item, 'Item rejected');
  } catch (err) { next(err); }
};

exports.pendingItems = async (req, res, next) => {
  try {
    const items = await GalleryItem.find({ status: 'pending' })
      .populate('album', 'title').populate('submittedBy', 'name').populate('skillArea', 'name')
      .sort({ createdAt: -1 });
    ok(res, items);
  } catch (err) { next(err); }
};
