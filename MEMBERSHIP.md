# Membership rules


The members of this organization are maintainers of the libraries and repos, they have admin powers in the org, and can merge pull requests.

**To become a member** you must:

1. Abide by the [Code of Conduct](https://github.com/ssbc/.github/blob/master/CODE_OF_CONDUCT.md)
2. Have 2-factor authentication enabled on your GitHub account
3. Have had created enough pull requests to our repos and gotten them merged by others members
4. Have been active at least once during the last 12 months

###### The last 2 rules are calculated automatically via [TrustNet Org](https://github.com/staltz/trustnet-org) every Monday as a [GitHub Actions job](https://github.com/ssbc/.github/actions/workflows/members.yml). These 4 rules are temporary, and should be completely re-evaluated on April 12th 2023.

All members of the org should also have rights to publish npm packages of repos hosted here, provided that we know each member's npm username, which we can input manually in [this "mirror npm" GitHub Action](https://github.com/ssbc/.github/actions/workflows/mirror-npm.yml) which outputs a list of commands to update the npm packages.