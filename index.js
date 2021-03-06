const core = require('@actions/core');
const getReviewers = require('./reviewers')

// get the week number (0 - 52) for the week in the year
// right now this is really naive
Date.prototype.getDayOfYear = function() {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  const today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  return Math.round((today - firstDayOfYear + 86400000) / 86400000) - 1;
};
Date.prototype.fromDayOfYear = function(days) {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
  return new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days))
};
const formatFromDayOfYear = (num) => new Date().fromDayOfYear(num).toLocaleDateString()

function parseRotation(rot) {
  if (!rot) return 7

  const rotStr = String(rot).toLowerCase()
  const rotNum = parseInt(String(rot).match(/\d+/) || ['1'][0], 10)
  let rotInterval = 1
  if (rotStr.includes('day') || rotStr.includes('daily')) {
    rotInterval = 1
  }
  
  if (rotStr.includes('week')) {
    rotInterval = 7    
  }

  if (rotStr.includes('month')) {
    rotInterval = 30  
  }

  if (rotStr.includes('year')) {
    rotInterval = 365
  }

  return rotNum * rotInterval
}

async function run() {
  try {
    const reviewerList = core.getInput('reviewers').split(/\s+/);
    const token = core.getInput('token');
    const fetchTeamUsers = core.getInput('fetch-team-users') || false;
    const rotationDays = parseRotation(core.getInput('rotation'));

    const selectTodaysReviewer = async (...dateArgs) => {
      let reviewers = reviewerList.map(x => x.replace(/^@/, '')), getTeam = () => {};

      if (fetchTeamUsers) {
        let data = await getReviewers({ token, reviewers: reviewerList })
        reviewers = data.reviewers
        getTeam = data.getTeam
      }
      
      let calendar = ''

      const dayOfYear = new Date(...dateArgs).getDayOfYear()
      const idx = Math.floor(dayOfYear / rotationDays) % reviewers.length
      const reviewer = reviewers[idx]
      const lastDayNum = dayOfYear + (rotationDays - (dayOfYear % rotationDays)) - 1
      calendar += `${reviewer} will review from Today until ${formatFromDayOfYear(lastDayNum)}.`
      
      const nextRevIdx = (idx + 1) % reviewers.length
      const nextReviewer = reviewers[nextRevIdx]
      calendar += ` ${nextReviewer} will review from ${formatFromDayOfYear(lastDayNum + 1)} until ${formatFromDayOfYear(lastDayNum + 1 + rotationDays)}.`

      return { reviewer, team: getTeam(reviewer), calendar }
    } 
    
    const { reviewer, team, calendar } = await selectTodaysReviewer()

    core.setOutput('reviewer', reviewer);
    core.setOutput('calendar', calendar);
    core.setOutput('team', team || reviewer); // default to just the reviewer if no team given
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
