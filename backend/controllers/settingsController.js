const Settings = require('../models/Settings');
const WaterLevel = require('../models/WaterLevel');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ 
        criticalThreshold: 90,
        updatedBy: req.user.id 
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update critical threshold
// @route   PUT /api/settings/threshold
// @access  Private/Admin
exports.updateThreshold = async (req, res) => {
  try {
    const { criticalThreshold } = req.body;

    if (criticalThreshold === undefined || criticalThreshold === null) {
      return res.status(400).json({ message: 'Critical threshold is required' });
    }

    if (criticalThreshold < 0) {
      return res.status(400).json({ message: 'Critical threshold cannot be negative' });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        criticalThreshold,
        updatedBy: req.user.id
      });
    } else {
      settings.criticalThreshold = criticalThreshold;
      settings.updatedBy = req.user.id;
      settings.updatedAt = Date.now();
      await settings.save();
    }

    // Update isAlert flag for all existing water level records
    const waterLevels = await WaterLevel.find();
    for (let record of waterLevels) {
      const shouldAlert = record.level > criticalThreshold;
      if (record.isAlert !== shouldAlert) {
        record.isAlert = shouldAlert;
        await record.save();
      }
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};