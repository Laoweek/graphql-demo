import { Octokit } from '@octokit/action';

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const branch = process.env.GITHUB_REF.replace('refs/heads/', '');

const { data } = await octokit.rest.repos.getBranch({
  owner,
  repo,
  branch
});

const res = await octokit.graphql(
  `
    mutation($input: CreateCommitOnBranchInput!){
      createCommitOnBranch(input: $input) {
        commit { url }
      }
    }
    `,
  {
    input: {
      branch: {
        repositoryNameWithOwner: `${owner}/${repo}`,
        branchName: branch
      },
      fileChanges: {
        additions: [
          {
            "path": "submodule-demo",
            "contents": Buffer.from("9cc5b5bb2d6e25eac2be88128670d3c254e0f66b").toString('base64')
          }
        ]
      },
      message: {
        headline: `test`,
        body: `test body`
      },
      expectedHeadOid: data.commit.sha
    }
  }
)

console.log(JSON.stringify(res, null, 2))