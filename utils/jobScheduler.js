const { Op } = require('sequelize');
const Job = require('../models-sequelize/Job');

async function updateExpiredJobs() {
  const now = new Date();
  try {
    // Close jobs where application deadline passed
    const closedByDeadline = await Job.update(
      { status: 'closed' },
      { where: { status: 'active', applicationDeadline: { [Op.lt]: now } } }
    );

    // Close jobs where explicit expiresAt passed
    const closedByExpiresAt = await Job.update(
      { status: 'closed' },
      { where: { status: 'active', expiresAt: { [Op.lt]: now } } }
    );

    // Remove featured flag for those where featuredUntil passed
    const unfeatured = await Job.update(
      { featured: false },
      { where: { featured: true, featuredUntil: { [Op.lt]: now } } }
    );

    const result = {
      closedByDeadline: closedByDeadline[0],
      closedByExpiresAt: closedByExpiresAt[0],
      unfeatured: unfeatured[0]
    };

    console.log('Job scheduler ran:', result);
    return result;
  } catch (err) {
    console.error('Job scheduler error:', err.message);
    throw err;
  }
}

function startJobScheduler(intervalMs = 1000 * 60 * 60) { // every hour by default
  console.log('Starting job scheduler (runs every', Math.round(intervalMs / 1000 / 60), 'minutes)');
  // Run immediately then on interval
  updateExpiredJobs().catch(() => {});
  const id = setInterval(() => updateExpiredJobs().catch(() => {}), intervalMs);
  return { stop: () => clearInterval(id) };
}

module.exports = { updateExpiredJobs, startJobScheduler };
