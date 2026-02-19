const Marquee = require('../models/Marquee');
const NewsCarousel = require('../models/NewsCarousel');
const Newsletter = require('../models/Newsletter');
const Video = require('../models/Video');
const NewsletterSettings = require('../models/NewsletterSettings');
const path = require('path');
const fs = require('fs');

// Helper function to extract YouTube ID from URL
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// MARQUEE CONTROLLERS
const getMarquees = async (req, res) => {
  try {
    const marquees = await Marquee.find().sort({ order: 1, createdAt: -1 });
    res.json(marquees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createMarquee = async (req, res) => {
  try {
    const { text, active = true, order = 0 } = req.body;
    
    const marquee = new Marquee({
      text,
      active,
      order
    });

    await marquee.save();
    res.status(201).json(marquee);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create marquee', error: error.message });
  }
};

const updateMarquee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const marquee = await Marquee.findByIdAndUpdate(id, updates, { new: true });
    
    if (!marquee) {
      return res.status(404).json({ message: 'Marquee not found' });
    }

    res.json(marquee);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update marquee', error: error.message });
  }
};

const deleteMarquee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const marquee = await Marquee.findByIdAndDelete(id);
    
    if (!marquee) {
      return res.status(404).json({ message: 'Marquee not found' });
    }

    res.json({ message: 'Marquee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete marquee', error: error.message });
  }
};

// NEWS CAROUSEL CONTROLLERS
const getNewsCarousel = async (req, res) => {
  try {
    const news = await NewsCarousel.find({ active: true }).sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllNewsCarousel = async (req, res) => {
  try {
    const news = await NewsCarousel.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createNewsCarousel = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      category,
      icon = '🚜',
      stats = [],
      features = []
    } = req.body;

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/news/${req.file.filename}`;
    }

    const newsItem = new NewsCarousel({
      title,
      excerpt,
      image: imagePath,
      category,
      icon,
      stats: typeof stats === 'string' ? JSON.parse(stats) : stats,
      features: typeof features === 'string' ? JSON.parse(features) : features,
      uploadDate: new Date()
    });

    await newsItem.save();
    res.status(201).json(newsItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create news item', error: error.message });
  }
};

const updateNewsCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      updates.image = `/uploads/news/${req.file.filename}`;
      
      const oldNews = await NewsCarousel.findById(id);
      if (oldNews && oldNews.image && oldNews.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', oldNews.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    if (updates.stats && typeof updates.stats === 'string') {
      updates.stats = JSON.parse(updates.stats);
    }
    if (updates.features && typeof updates.features === 'string') {
      updates.features = JSON.parse(updates.features);
    }

    const newsItem = await NewsCarousel.findByIdAndUpdate(id, updates, { new: true });
    
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }

    res.json(newsItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update news item', error: error.message });
  }
};

const deleteNewsCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsItem = await NewsCarousel.findById(id);
    
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }

    if (newsItem.image && newsItem.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', newsItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await NewsCarousel.findByIdAndDelete(id);
    res.json({ message: 'News item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete news item', error: error.message });
  }
};

const likeNewsCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const newsItem = await NewsCarousel.findById(id);
    
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }

    if (action === 'like') {
      newsItem.likes += 1;
    } else if (action === 'unlike' && newsItem.likes > 0) {
      newsItem.likes -= 1;
    }

    await newsItem.save();
    res.json({ likes: newsItem.likes });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update likes', error: error.message });
  }
};

// NEWSLETTER CONTROLLERS
const detectContactType = (input) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  
  if (emailRegex.test(input)) {
    return 'email';
  } else if (phoneRegex.test(input.replace(/[\s\-\(\)]/g, ''))) {
    return 'phone';
  }
  return null;
};

const getNewsletters = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.contactValue = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const newsletters = await Newsletter.find(query).sort({ createdAt: -1 });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const subscribeNewsletter = async (req, res) => {
  try {
    const { contact } = req.body;
    
    if (!contact) {
      return res.status(400).json({ 
        message: 'Contact information is required',
        success: false 
      });
    }

    const contactType = detectContactType(contact);
    
    if (!contactType) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address or phone number',
        success: false 
      });
    }

    const contactValue = contactType === 'phone' 
      ? contact.replace(/[\s\-\(\)]/g, '')
      : contact.toLowerCase();

    const existingSubscription = await Newsletter.findOne({ 
      contactValue: contactValue,
      contactType: contactType 
    });
    
    if (existingSubscription) {
      return res.status(400).json({ 
        message: `${contactType === 'email' ? 'Email' : 'Phone number'} already subscribed`,
        success: false 
      });
    }

    const newsletterData = {
      contactType,
      contactValue,
      status: 'active'
    };

    if (contactType === 'email') {
      newsletterData.email = contactValue;
    } else {
      newsletterData.phone = contactValue;
    }

    const newsletter = new Newsletter(newsletterData);
    await newsletter.save();

    res.status(201).json({ 
      message: 'Successfully subscribed!', 
      success: true,
      data: newsletter 
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Failed to subscribe', 
      error: error.message,
      success: false 
    });
  }
};

const updateNewsletterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const newsletter = await Newsletter.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter subscription not found' });
    }

    res.json(newsletter);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update subscription', error: error.message });
  }
};

const deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newsletter = await Newsletter.findByIdAndDelete(id);
    
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter subscription not found' });
    }

    res.json({ message: 'Newsletter subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subscription', error: error.message });
  }
};

// NEWSLETTER SETTINGS CONTROLLERS
const getNewsletterSettings = async (req, res) => {
  try {
    let settings = await NewsletterSettings.findOne();
    
    if (!settings) {
      settings = new NewsletterSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateNewsletterSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    let settings = await NewsletterSettings.findOne();
    
    if (!settings) {
      settings = new NewsletterSettings(updates);
    } else {
      Object.assign(settings, updates);
    }
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update settings', error: error.message });
  }
};

// VIDEO CONTROLLERS
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ active: true }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, category, duration } = req.body;
    
    const youtubeId = extractYouTubeId(youtubeUrl);
    
    if (!youtubeId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }
    
    const video = new Video({
      title,
      description,
      youtubeUrl,
      youtubeId,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      category,
      duration
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create video', error: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    if (updates.youtubeUrl) {
      const youtubeId = extractYouTubeId(updates.youtubeUrl);
      
      if (!youtubeId) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }
      
      updates.youtubeId = youtubeId;
      updates.thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    const video = await Video.findByIdAndUpdate(id, updates, { new: true });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update video', error: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findByIdAndDelete(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete video', error: error.message });
  }
};

module.exports = {
  // Marquee
  getMarquees,
  createMarquee,
  updateMarquee,
  deleteMarquee,
  
  // News Carousel
  getNewsCarousel,
  getAllNewsCarousel,
  createNewsCarousel,
  updateNewsCarousel,
  deleteNewsCarousel,
  likeNewsCarousel,
  
  // Newsletter
  getNewsletters,
  subscribeNewsletter,
  updateNewsletterStatus,
  deleteNewsletter,
  
  // Newsletter Settings
  getNewsletterSettings,
  updateNewsletterSettings,
  
  // Videos
  getVideos,
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo
};
