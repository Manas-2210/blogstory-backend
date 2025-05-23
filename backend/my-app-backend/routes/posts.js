const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../database/connection');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.created_at,
        p.updated_at,
        u.username as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `);

    // Create summary for each post (first 200 characters)
    const postsWithSummary = posts.map(post => ({
      ...post,
      summary: post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
    }));

    res.json(postsWithSummary);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await pool.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.created_at,
        p.updated_at,
        p.author_id,
        u.username as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(posts[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new post (authenticated)
router.post('/', authenticateToken, [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const authorId = req.user.id;

    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, authorId]
    );

    // Get the created post with author info
    const [createdPost] = await pool.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.created_at,
        p.updated_at,
        p.author_id,
        u.username as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost[0]
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post (authenticated, author only)
router.put('/:id', authenticateToken, [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    // Check if post exists and user is the author
    const [posts] = await pool.execute(
      'SELECT author_id FROM posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (posts[0].author_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Update post
    await pool.execute(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );

    // Get updated post with author info
    const [updatedPost] = await pool.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.created_at,
        p.updated_at,
        p.author_id,
        u.username as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: 'Post updated successfully',
      post: updatedPost[0]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post (authenticated, author only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if post exists and user is the author
    const [posts] = await pool.execute(
      'SELECT author_id FROM posts WHERE id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (posts[0].author_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Delete post
    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own posts (authenticated)
router.get('/user/my-posts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [posts] = await pool.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.created_at,
        p.updated_at,
        u.username as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.author_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    // Create summary for each post
    const postsWithSummary = posts.map(post => ({
      ...post,
      summary: post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
    }));

    res.json(postsWithSummary);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;