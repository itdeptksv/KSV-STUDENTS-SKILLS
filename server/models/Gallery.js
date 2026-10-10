const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    skillArea: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillArea' },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
    coverImage: { type: String },
    isPublic: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const galleryItemSchema = new mongoose.Schema(
  {
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'GalleryAlbum', required: true },
    type: { type: String, enum: ['photo', 'video', 'artwork', 'project'], required: true },
    title: { type: String, required: true, trim: true },
    caption: { type: String },
    filename: { type: String },
    originalName: { type: String },
    path: { type: String },
    externalUrl: { type: String }, // for approved external video links
    skillArea: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillArea' },
    taggedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    displayNameOnly: { type: Boolean, default: true }, // first name only
    consentVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    isFeatured: { type: Boolean, default: false },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

galleryItemSchema.index({ album: 1, status: 1 });
galleryItemSchema.index({ status: 1 });

module.exports = {
  GalleryAlbum: mongoose.model('GalleryAlbum', albumSchema),
  GalleryItem: mongoose.model('GalleryItem', galleryItemSchema),
};
