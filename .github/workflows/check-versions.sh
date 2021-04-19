#!/usr/bin/env bash

set -u
set -e

isPullRequest () {
  [[ "$GITHUB_EVENT_NAME" == pull_request  ]];
}

isPreRelease () {
  version=$(jq -r '.version' package.json)
  pre_release=$(echo $version | cut -f2 -sd-)
  [[ ! -z "$pre_release" ]];
}

isUnpublished () {
  name=$(jq -r '.name' package.json)
  version=$(jq -r '.version' package.json)
  [[ -z $(npm info  "$name"@"$version") ]];
}

shouldPublishPR () {
  isUnpublished && isPullRequest && isPreRelease;
}

shouldPublishProd () {
  isUnpublished && ! isPullRequest && ! isPreRelease;
}

shouldPublish () {
  shouldPublishPR || shouldPublishProd;
}

# This overrides the config set in actions/setup-node
# rm .npmrc

name=$(jq -r '.name' package.json)

if shouldPublish; then
  echo $name $version

  echo "::set-output name=continue::true"
else
  echo "::set-output name=continue::false"
fi