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
                "contents": Buffer.from("9dc0d11e6f5ea9fd25df9c5cda997e10728cc1cd").toString('base64')
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