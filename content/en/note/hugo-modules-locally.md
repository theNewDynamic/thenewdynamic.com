---
title: Working with Hugo Module Locally
description: Hugo Module developement requires to be able to work locally. This walkthrough will cover how to setup a Module without a repo, import it in a project and start developing it!
---

Hugo Module developement requires to be able to work locally. No one wants to push their changes to a repo, in order for another Hugo project to imports those changes.

In this note we'll cover how to approach Hugo Module local developement without a repo setup.

We'll use two Hugo projects throughout this walkthrough.

- A __Hugo Module__ on one hand, which we want to edit locally.
- A __Hugo Website__ on the other hand which should import our local module.

## Init the local Hugo Module.
Let's pretend our imaginary repo will live at `github.com/someone/hugo-module.`

As the repo does not exist yet `hugo mod init` won't be able to validate the repo. 
We'll have to create a `go.mod` file ourselves. It should look like this:

```go
module github.com/someone/hugo-module

go 1.14
```


## Importing the local Module

Good. Now let's switch to our Hugo Website, the Hugo project which will import our local Hugo Module.

We'll start by adding the local Module to our list of imports:

```yaml
# config.yaml

module:
  imports:
    - path: github.com/someone/hugo-module
```

__Don't run `hugo` yet!__

Now we'll be working on the Hugo Website's own `go.mod` file, not the Module's.

We know that if we run `hugo` while importing a Module with a proper repo on GitHub or else, Hugo will add a `require` directive to our project's `go.mod` file. This directive would look like this:

```go
require github.com/someone/hugo-module v0.0.0-somegiberish // indirect
```

Or with multiple imports:

```go
require (
  github.com/someone/hugo-module v0.0.0-somegiberish // indirect
  github.com/someone/other-repo v0.1.1 // indirect
)
```

Ok, we'll assume our Hugo Website already sports a `go.mod` file pointing to its own repo. 
Adding the `require` statement, it should now look like this:
```go
module github.com/someone/hugo-website

go 1.14

require github.com/someone/hugo-module v0.0.0-somegiberish // indirect
```

__Don't run `hugo` yet!__

**Almost there, here comes the real deal!, the real trick:** in order to tell Hugo to look for our local files instead of the distant (inexisting!) repo, we'll add one innocent line to the Hugo Website's `go.mod` file.

```go
module github.com/someone/my-hugo-project

// Innocent line below!
replace github.com/someone/hugo-module => /Users/someone/dir/hugo-module

go 1.14

require github.com/someone/hugo-module v0.0.0-somegiberish // indirect
```

The `replace` directive, positioned before the `require` one, will make sure Hugo picks the files straight from your machine, rather than the repo's. It is fully integrated with Hugo Serve, so any file updated in our local Hugo Module will trigger a synch of the Hugo Website.

Ok! Now you can run `hugo` or `hugo serve` and start playing around with your local Hugo Module!

## Final notes

Whenever you need to comment out the replace statement, `go` uses `//`:

```go
// replace github.com/someone/hugo-module => /Users/someone/dir/hugo-module
```

Also, just like `require` covered above, the `replace` directive can take multiple "repos":

```go
replace (
	github.com/someone/hugo-module => /Users/someone/dir/hugo-module
  github.com/someone/hugo-emojis => /Users/someone/dir/hugo-emojis
)
```

Of course, once your files are up in the cloud, GitHub or otherwise, you should remove the `require` directive (the one ending with `v0.0.0-giberish`) and let `hugo` writes its own `require` with the proper versioning suffix.