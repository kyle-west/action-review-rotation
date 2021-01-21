# _Picky_ Reviewer Rotation

Github Action that rotates through a list of reviewers for reviewing a PR

## Inputs

### `reviewers`
**REQUIRED** A whitespace separated list of reviewers and/or teams for reviewing
### `rotation`
The frequency of rotation (e.g. "2 days", "4 weeks", "3 months", "1 year"). Default is `1 week`.
### `fetch-team-users`
Boolean if the rotation list should expand teams to individual members from teams given
### `token`
A github token to access team members if `fetch-team-users` is true


## Outputs:

### `reviewer`
The assigned reviewer or team
### `team`
The team the reviewer belongs to (if applicable)
### `calendar`
The immediate review schedule. Example: _team1 will review from Today until 3/25/2021. team2 will review from 3/26/2021 until 4/16/2021._


## Example usage

```yml
- uses: kyle-west/action-review-rotation@v0.2
  id: getRev
  with:
    reviewers: kyle-west digital-taco/admin digital-taco/qa
    rotation: 4 Weeks
- run: echo "reviewer is ${{ steps.getRev.outputs.reviewer }}"
- run: echo "calendar is ${{ steps.getRev.outputs.calendar }}"
```