const WaterLevel = require('../models/WaterLevel');
const Settings = require('../models/Settings');

// @desc    Get all water level records
// @route   GET /api/water-levels
// @access  Private
exports.getWaterLevels = async (req, res) => {
  try {
    const waterLevels = await WaterLevel.find()
      .populate('recordedBy', 'email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: waterLevels.length,
      data: waterLevels
    });
  } catch (error) {
    console.error('Get water levels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add water level record
// @route   POST /api/water-levels
// @access  Private/Operator
exports.addWaterLevel = async (req, res) => {
  try {
    const { level, date, notes } = req.body;

    // Validation
    if (level === undefined || level === null) {
      return res.status(400).json({ message: 'Water level is required' });
    }

    if (level < 0) {
      return res.status(400).json({ message: 'Water level cannot be negative' });
    }

    // Get critical threshold
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ criticalThreshold: 90 });
    }

    const isAlert = level > settings.criticalThreshold;

    // Create water level record
    const waterLevel = await WaterLevel.create({
      level,
      date: date || new Date(),
      recordedBy: req.user.id,
      notes,
      isAlert
    });

    const populatedRecord = await WaterLevel.findById(waterLevel._id)
      .populate('recordedBy', 'email');

    res.status(201).json({
      success: true,
      data: populatedRecord
    });
  } catch (error) {
    console.error('Add water level error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update water level record
// @route   PUT /api/water-levels/:id
// @access  Private/Operator
exports.updateWaterLevel = async (req, res) => {
  try {
    const { level, date, notes } = req.body;

    let waterLevel = await WaterLevel.findById(req.params.id);

    if (!waterLevel) {
      return res.status(404).json({ message: 'Water level record not found' });
    }

    // Validation
    if (level !== undefined && level < 0) {
      return res.status(400).json({ message: 'Water level cannot be negative' });
    }

    // Get critical threshold
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ criticalThreshold: 90 });
    }

    // Update fields
    if (level !== undefined) {
      waterLevel.level = level;
      waterLevel.isAlert = level > settings.criticalThreshold;
    }
    if (date) waterLevel.date = date;
    if (notes !== undefined) waterLevel.notes = notes;

    await waterLevel.save();

    const populatedRecord = await WaterLevel.findById(waterLevel._id)
      .populate('recordedBy', 'email');

    res.json({
      success: true,
      data: populatedRecord
    });
  } catch (error) {
    console.error('Update water level error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete water level record
// @route   DELETE /api/water-levels/:id
// @access  Private/Operator
exports.deleteWaterLevel = async (req, res) => {
  try {
    const waterLevel = await WaterLevel.findById(req.params.id);

    if (!waterLevel) {
      return res.status(404).json({ message: 'Water level record not found' });
    }

    await WaterLevel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Water level record deleted successfully'
    });
  } catch (error) {
    console.error('Delete water level error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get alert records
// @route   GET /api/water-levels/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await WaterLevel.find({ isAlert: true })
      .populate('recordedBy', 'email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};