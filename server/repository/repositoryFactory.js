'use strict';

var repositoryFactory = function () {
    var repos = this;
    var repoList = [{ name: 'challenge', source: './challengeRepository' },
        { name: 'team', source: './teamRepository' },
        { name: 'teamScore', source: './teamScoreRepository' }];

    repoList.forEach(function (repo) {
        repos[repo.name] = require(repo.source)();
    });
};

module.exports = new repositoryFactory;