const express = require('express');
const { MedicineReminder, MedicineReminderLog } = require('../models-sequelize');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Helper function to calculate next refill date
const calculateNextRefill = (startDate, frequency) => {
  const date = new Date(startDate);
  switch (frequency) {
    case 'daily':
      return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    case 'twice-daily':
      return new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
    case 'three-times-daily':
      return new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days
    case 'weekly':
      return new Date(date.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    case 'as-needed':
      return new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
    default:
      return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
};

// Create reminder
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      frequency,
      startDate,
      endDate,
      refillThreshold,
      preferredPharmacy,
      reminderTime,
      notificationMethod,
    } = req.body;

    if (!medicineName || !frequency || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reminder = await MedicineReminder.create({
      userId: req.user.id,
      medicineName,
      dosage,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      refillThreshold: refillThreshold || 7,
      preferredPharmacy,
      reminderTime: reminderTime || '09:00',
      notificationMethod: notificationMethod || 'email',
      nextRefillDate: calculateNextRefill(startDate, frequency),
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reminders for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reminders = await MedicineReminder.findAll({
      where: { userId: req.user.id },
      order: [['nextRefillDate', 'ASC']],
      include: ['Logs'],
    });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active reminders only
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const reminders = await MedicineReminder.findAll({
      where: { userId: req.user.id, status: 'active' },
      order: [['nextRefillDate', 'ASC']],
    });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching active reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reminder by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await MedicineReminder.findByPk(req.params.id, {
      include: ['Logs'],
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update reminder
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await MedicineReminder.findByPk(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      medicineName,
      dosage,
      frequency,
      startDate,
      endDate,
      refillThreshold,
      preferredPharmacy,
      reminderTime,
      notificationMethod,
      status,
    } = req.body;

    // Update fields
    if (medicineName) reminder.medicineName = medicineName;
    if (dosage) reminder.dosage = dosage;
    if (frequency) reminder.frequency = frequency;
    if (startDate) reminder.startDate = new Date(startDate);
    if (endDate) reminder.endDate = new Date(endDate);
    if (refillThreshold) reminder.refillThreshold = refillThreshold;
    if (preferredPharmacy) reminder.preferredPharmacy = preferredPharmacy;
    if (reminderTime) reminder.reminderTime = reminderTime;
    if (notificationMethod) reminder.notificationMethod = notificationMethod;
    if (status) reminder.status = status;

    // Recalculate next refill if frequency changed
    if (frequency || startDate) {
      reminder.nextRefillDate = calculateNextRefill(
        startDate || reminder.startDate,
        frequency || reminder.frequency
      );
    }

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark as refilled
router.post('/:id/refill-ordered', authenticateToken, async (req, res) => {
  try {
    const { pharmacyId } = req.body;
    const reminder = await MedicineReminder.findByPk(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    reminder.lastRefillDate = new Date();
    reminder.nextRefillDate = calculateNextRefill(new Date(), reminder.frequency);
    await reminder.save();

    // Log the refill
    await MedicineReminderLog.create({
      reminderId: reminder.id,
      sentAt: new Date(),
      method: 'manual',
      status: 'sent',
      refillOrdered: true,
      refillPharmacyId: pharmacyId || null,
    });

    res.json(reminder);
  } catch (error) {
    console.error('Error marking as refilled:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pause/Resume reminder
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const reminder = await MedicineReminder.findByPk(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    reminder.status = status;
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await MedicineReminder.findByPk(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete associated logs
    await MedicineReminderLog.destroy({ where: { reminderId: reminder.id } });

    // Delete reminder
    await reminder.destroy();
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
