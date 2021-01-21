const core = require('@actions/core');
const getReviewers = require('./reviewers')

// get the week number (0 - 52) for the week in the year
// right now this is really naive
Date.prototype.getWeek = function() {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  const dayOfYear = ((today - firstDayOfYear + 86400000) / 86400000);
  return Math.ceil(dayOfYear / 7) - 1
};

async function run() {
  try {
    const reviewerList = core.getInput('reviewers').split(/\s+/);
    const token = core.getInput('token');

    const selectThisWeeksReviewer = async (...dateArgs) => {
      const { reviewers, getTeam } = await getReviewers({ token, reviewers: reviewerList })
      const weekNum = new Date(...dateArgs).getWeek()
      const reviewer = reviewers[weekNum % reviewers.length]
      return { weekNum, idx: weekNum % reviewers.length, reviewer, team: getTeam(reviewer) }
    } 
    
    const { reviewer, team } = await selectThisWeeksReviewer()

    core.setOutput('reviewer', reviewer);
    core.setOutput('team', team || reviewer); // default to just the reviewer if no team given
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
