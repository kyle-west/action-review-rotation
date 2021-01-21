const github = require('@actions/github');

const parseUser = user => {
  const [ name, team ] = user.replace(/^@/, '').split('@')
  return [
    name,
    team && team.replace(/^@/, ''),
  ]
}

module.exports = async ({ token, reviewers }) => {
  const octokit = github.getOctokit(token)
  
  const getMembers = (team) => {
    const [org, team_slug] = team.split('/')
    return octokit.teams.listMembersInOrg({
      org,
      team_slug,
    }).then(({data}) => data.map(({login}) => login))
  }
  
  const individuals = new Set()
  const memberMap = {}

  for (let reviewer of reviewers) {
    const [rev, specifiedTeam] = parseUser(reviewer)

    // if they supply a team, then go fetch the team members
    if (rev.includes('/')) {
      const members = await getMembers(rev);
      [...members].sort().forEach(person => {
        individuals.add(person);
        memberMap[person] = rev
      });
    } else {
      individuals.add(rev)
      memberMap[rev] = specifiedTeam
    }
  }

  return { reviewers: [...individuals] , memberMap, getTeam: (member) => memberMap[member] }
}
