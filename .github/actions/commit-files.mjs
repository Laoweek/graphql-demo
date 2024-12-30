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
            "path": "README.txt",
            "contents": Buffer.from("hello world\n").toString('base64')
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