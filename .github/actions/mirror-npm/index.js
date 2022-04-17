import {execa} from 'execa';
const core = require('@actions/core');
const github = require('@actions/github');

async function forEachSourceRepo(octokit, org, cb) {
  let count = 0;
  for await (const response of octokit.paginate.iterator(
    octokit.rest.repos.listForOrg,
    {org, type: 'sources'},
  )) {
    const page = response.data;
    for (const repo of page) {
      if (++count === 10) return;
      cb(repo);
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
    await forEachSourceRepo(octokit, org, (repo) => {
      const {exitCode, stdout, stderr} = await execa('npm', [
        'info',
        repo.name,
        '--json',
      ]);
      console.log(exitCode, stdout, stderr);
      if (exitCode === 0) {
        const pkg = JSON.parse(stdout);
        console.log(`${pkg.name} is an npm package`);
        const prevOwners = pkg.maintainers.map((s) => s.split(' ')[0]);
        const rmOwners = prevOwners.filter((s) => !owners.includes(s));
        const addOwners = owners.filter((s) => !prevOwners.includes(s));
        for (const removable of rmOwners) {
          console.log(`  npm owner rm ${removable} ${pkg.name}`);
        }
        for (const addable of addOwners) {
          console.log(`  npm owner add ${addable} ${pkg.name}`);
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
