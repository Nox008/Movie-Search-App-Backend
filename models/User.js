const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bookmarks: [{
    movieId: { type: String, required: true },
    title: { type: String, required: true },
    poster: { type: String },
    year: { type: String },
    imdbRating: { type: String },
    genre: { type: String },
    bookmarkedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add bookmark
UserSchema.methods.addBookmark = function(movieData) {
  const existingBookmark = this.bookmarks.find(
    bookmark => bookmark.movieId === movieData.movieId
  );
  
  if (existingBookmark) {
    return false; // Already bookmarked
  }
  
  this.bookmarks.unshift(movieData); // Add to beginning
  return true;
};

// Method to remove bookmark
UserSchema.methods.removeBookmark = function(movieId) {
  const initialLength = this.bookmarks.length;
  this.bookmarks = this.bookmarks.filter(
    bookmark => bookmark.movieId !== movieId
  );
  return this.bookmarks.length < initialLength; // Returns true if removed
};

// Method to check if movie is bookmarked
UserSchema.methods.isBookmarked = function(movieId) {
  return this.bookmarks.some(bookmark => bookmark.movieId === movieId);
};

module.exports = mongoose.model('User', UserSchema);