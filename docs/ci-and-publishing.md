# CI and npm publishing

The workflow at [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on pushes to `main`, pull requests, version-tag pushes, and manual dispatch.

## Continuous integration

The `build-and-test` job runs on Node.js 22 and 24. It installs from the lockfile, audits dependencies, lints the project, runs tests, and builds the CLI:

```sh
npm ci
npm audit --audit-level=moderate
npm run lint
npm test
npm run build
```

`npm test` also runs a clean build. The generated-project suite validates supported framework/database/language combinations.

## Configure npm publishing

Before creating a release:

1. Make sure the npm package exists and the publishing account can publish it.
2. Create an npm access token with permission to publish `men-pack`.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions** and add a repository secret named `NPM_TOKEN`.
4. Ensure GitHub Actions is allowed to run for the repository.

The publishing job uses `NODE_AUTH_TOKEN` from that secret and requests an npm provenance attestation using GitHub's OIDC token. The job has `id-token: write` permission; do not remove it while using `--provenance`.

## Release a version

Update the package version and create a matching Git tag. For a patch release:

```sh
npm version patch
git push origin main --follow-tags
```

For an explicit version, `npm version` updates the package manifest and lockfile and creates the matching commit and tag:

```sh
npm version 3.0.8
git push origin main --follow-tags
```

The `v*` tag triggers the workflow. Publishing runs only for a tag, after the build-and-test matrix succeeds. Before publishing, the workflow removes the leading `v` and verifies that the remaining value exactly matches `package.json`'s version. A mismatch fails the job. The publish step runs:

```sh
npm publish --access public --provenance
```

The version must not already exist on npm.

## Manual workflow runs

Use **Actions → Build, Test, and Publish men-pack → Run workflow** to run verification manually. A manual run on a branch does not publish; the publish job is restricted to `v*` tags.

## Verify before releasing locally

```sh
npm ci
npm audit --audit-level=moderate
npm run lint
npm test
npm run build
npm pack --dry-run
```
