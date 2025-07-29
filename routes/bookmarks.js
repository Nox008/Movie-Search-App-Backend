// routes/bookmarks.js
const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all bookmarks for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('bookmarks');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching bookmarks' });
  }
});

// Add bookmark
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { movieId, title, poster, year, imdbRating, genre } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie ID and title are required' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const movieData = {
      movieId,
      title,
      poster: poster || '',
      year: year || '',
      imdbRating: imdbRating || '',
      genre: genre || ''
    };

    const wasAdded = user.addBookmark(movieData);
    
    if (!wasAdded) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie is already bookmarked' 
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Movie bookmarked successfully',
      bookmark: movieData
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding bookmark' });
  }
});

// Remove bookmark
router.delete('/:movieId', authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie ID is required' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wasRemoved = user.removeBookmark(movieId);
    
    if (!wasRemoved) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bookmark not found' 
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ success: false, message: 'Server error while removing bookmark' });
  }
});

// Check if movie is bookmarked
router.get('/check/:movieId', authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie ID is required' 
      });
    }

    const user = await User.findById(req.user._id).select('bookmarks');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isBookmarked = user.isBookmarked(movieId);

    res.json({
      success: true,
      isBookmarked
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ success: false, message: 'Server error while checking bookmark' });
  }
});

module.exports = router;