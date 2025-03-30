---
title: Merging Git Repositories
description:
  This guide demonstrates how to merge multiple Git repositories into a monorepo
  while preserving commit history. It adds a repository prefix to each commit
  message and moves the contents into a subdirectory, ensuring a clean and
  organized project structure.
publishedDate: 2025-03-30
keywords:
  - git
  - monorepo
  - polyrepo
  - merge
---

# {frontmatter.title}

I started developing a small app a while ago, but I wasn’t sure whether to
structure it as a mono repo or poly repo. Since I’m working with a tech stack
I’m not very familiar with, I expected to make mistakes and start over multiple
times. So, I initially decided to go with a polyrepo approach, allowing for a
clean environment in each repository.

The app has started coming together over the past few days. While aligning the
directories, I realized that I need several steps to fully set up the
environment. Though I could structure things better, finding the optimal setup
will take time. I also wanted each repo to be simply named under a namespace. I
used Git organizations for this initially, but I didn’t like the idea and didn’t
want to create one just yet. So, I decided to switch to a monorepo approach. Who
knows, I might regret this and end up writing another blog post about splitting
a monorepo.

The goal is to merge several repositories into one, with each repo as a
subdirectory in the main repository. Additionally, I want to preserve the commit
history, so the repository names will be prefixed to the commit messages. After
reviewing a few articles, I realized that this isn’t too difficult to achieve.

I want to document the steps I took, so here’s how I did it.

## Prepare Repositories

To transform the history into the desired format, we need to achieve two things:

1. Add the repository’s name to each commit message.
2. Move everything except the .git folder into a subdirectory.

Here's the command to do that:

```sh
git filter-branch \
  --msg-filter 'echo "[<prefix>] $(cat)"' \
  --tree-filter "
    mkdir <subname>;
    find . -mindepth 1 -maxdepth 1 \
      ! -name '.git' \
      ! -name '<subname>' \
      -exec mv {} <subname>/ \;
  "
```

Replace `<prefix>` with the prefix you’d like to add to each commit and
`<subname>` with the name of the subdirectory where the repository will be
moved.

> **Caution:** This rewrites the entire history. A backup will be created in
> `refs/original/refs/heads/<branch>`. You can use
> `git reset --hard refs/original/refs/heads/<branch>` to undo the changes.

> **Note:** This is a Git operation, so Git-ignored files like `.env` won’t be
> moved. You’ll need to handle those separately.

> I’m assuming we're only merging the main branches of the repositories.
> However, you can use `rev-list` options like `--all` after the `filter-branch`
> command with a `--` to further specify.

### Breakdown

Let’s break this down step by step and see how we achieved it.

`git filter-branch` is a powerful tool that lets you modify commit history, and
the modification is applied one by one to each commit.

`--msg-filter` helps us modify commit messages, it provides the original commit
message as the standard input, and take the standard output to be the new commit
message.

Here, we use `cat` to output the original commit message, then prefix it with
the repository name, and `echo` it as the new commit message.

`--tree-filter` is the filter for rewriting the tree and its contents. The
argument is evaluated in shell with the working directory set to the root of the
checked out tree.

We create a subdirectory, find everything in the root directory except the
`.git` folder and the target subdirectory, and move them into the new directory.

The `-exec` flag of find allows us to execute a command on each file that it
finds, `!` means not, and `{}` is replaced by the file’s pathname.

### Example

#### Before

##### Structure

```plain
.
├── cmd
├── docker-compose.yml
├── Dockerfile
├── go.mod
├── go.sum
├── internal
├── Makefile
├── README.md
```

##### Commit History

```log
4cce943 (HEAD -> main, origin/main, origin/HEAD) sign out
8458844 otp send cooldown
c0ad146 restructure
9b5be0b user and otp login
06e02c8 restructure again and improvments
246e063 update model
040e28c logger
4113764 restructure
6f91dff otp draft
a8571dd move services
68b0dd9 typesafe env
998b8a3 auth api draft
528baf6 restructure
8bea10c create quiz api
89927d1 Initial commit
```

#### After

##### Structure

```plain
.
└── core/
    ├── cmd
    ├── docker-compose.yml
    ├── Dockerfile
    ├── go.mod
    ├── go.sum
    ├── internal
    ├── Makefile
    └── README.md
```

##### Commit History

```log
1da7315 (HEAD -> main) [core] sign out
4e280e2 [core] otp send cooldown
e13de34 [core] restructure
f7ab966 [core] user and otp login
033f8af [core] restructure again and improvments
04e3310 [core] update model
7e07979 [core] logger
ff660ee [core] restructure
dfe909c [core] otp draft
949ace9 [core] move services
7cf88f6 [core] typesafe env
e503c32 [core] auth api draft
22ec83a [core] restructure
b1aa00b [core] create quiz api
81948e5 [core] Initial commit
```

## Merging Repositories

Now that we’ve set up the repositories in the desired format, we can merge them
into one Monorepo.

We’ll need a repository to serve as the destination for the merge. This could be
one of the existing repositories or, if you don’t want favoritism, a new
repository entirely. I prefer not to alter my histories, so I’ll create a new
directory and initialize a new Git repository there:

```sh
mkdir mono
cd mono
git init
```

In the mono directory, add the remotes for each repository:

```sh
git remote add -f <repo-name> path/to/repo
```

Once all repositories are added, we can merge them. It’s important to retain the
commits’ order, so they appear as though they were made in the new monorepo. Git
doesn’t provide a built-in way to do this, so we’ll need to fetch every commit,
sort them by time, and cherry-pick them in the correct order:

```sh
git rev-list --all --date-order --reverse | \
while read commit; do
  git cherry-pick $commit
done
```

## Result

### Structure

```plain
.
├── core/
│   ├── cmd
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── internal
│   ├── Makefile
│   └── README.md
└── mobile/
    ├── analysis_options.yaml
    ├── assets
    ├── env
    ├── flutter_native_splash.yaml
    ├── ios
    ├── lib
    ├── makefile
    ├── pubspec.lock
    ├── pubspec.yaml
    ├── README.md
    └── test
```

### Commit History

```log
9502997 (HEAD -> main) [mobile] user and auth
e1169a0 [mobile] env
59a76a8 [core] sign out
b1709e7 [core] otp send cooldown
fa12506 [core] restructure
c48936d [core] user and otp login
46cbe12 [core] restructure again and improvments
96dede8 [mobile] basic auth present
41c47a4 [mobile] splash
44bf679 [mobile] setup
acf5b3d [mobile] init
6175404 [core] update model
d150ab9 [core] logger
a43a578 [core] restructure
a0dd47a [core] otp draft
a56146f [core] move services
16312f3 [core] typesafe env
57b0ddd [core] auth api draft
3cb2331 [core] restructure
5b607ff [core] create quiz api
bea9858 [core] Initial commit
```

## Reference

- [Prefixing commit messages](https://www.janosgyerik.com/rewrite-git-history-to-prefix-a-range-of-commit-messages/)
- [Moving stuff into a subdirectory](https://stackoverflow.com/questions/18667308/move-file-and-directory-into-a-sub-directory-along-with-commit-history)
- [Merging Repositories](https://gfscott.com/blog/merge-git-repos-and-keep-commit-history/#connect-the-repos)
