const execa = require('execa');
const core = require('@actions/core');
const github = require('@actions/github');

async function forEachSourceRepo(octokit, org, cb) {
  for await (const response of octokit.paginate.iterator(
    octokit.rest.repos.listForOrg,
    {org, type: 'sources'},
  )) {
    const page = response.data;
    for (const repo of page) {
      await cb(repo);
    }
  }
}

async function run() {
  try {
    const token = core.getInput('token');
    const org = core.getInput('org');
    const owners = core
      .getInput('owners')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);

    if (owners.length === 0) core.setFailed('missing "owners" input');

    const octokit = github.getOctokit(token);

    console.log('Owners');
    for (const owner of owners) {
      console.log(owner);
    }
    console.log('\n');

    console.log('Repos:');
    await forEachSourceRepo(octokit, org, async (repo) => {
      let pkgName;
      try {
        const {data} = await octokit.rest.repos.getContent({
          owner: org,
          repo: repo.name,
          path: 'package.json',
        });
        const {encoding, content} = data;
        const packageJson = JSON.parse(
          Buffer.from(content, encoding).toString('utf8'),
        );
        pkgName = packageJson.name;
      } catch (err) {
        return;
      }
      let response;
      try {
        response = await execa('npm', ['owner', 'ls', pkgName]);
      } catch (e) {
        return;
      }
      if (response.exitCode === 0) {
        console.log(`${pkgName} is an npm package`);
        const prevOwners = response.stdout
          .split('\n')
          .map((s) => s.split(' ')[0].trim());
        const rmOwners = prevOwners.filter((s) => !owners.includes(s));
        const addOwners = owners.filter((s) => !prevOwners.includes(s));
        for (const removable of rmOwners) {
          console.log(`  npm owner rm ${removable} ${pkgName}`);
        }
        for (const addable of addOwners) {
          console.log(`  npm owner add ${addable} ${pkgName}`);
        }
        console.log('\n');
      }
    });
    console.log('\n');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
