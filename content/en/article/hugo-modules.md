---
title: 'Hugo Modules'
date: 2018-02-05T20:32:27.000Z
lastmod: 2019-08-16T22:32:27.000Z
description: >-
  Let's try and understand the impact of Hugo modules
draft: true
---

Draft: Yes
Tags: Hugo, Hugo Module

Back in Hugo introduced its Module system. Pretty much like any package solution it allows any Hugo project defined as a Module, be it a full website or a theme or a collection of useful files to to use any files stored on a repository somewhere and mount it as its own. 

In this article, we'll see how any Hugo project can use files stored on a distant repository and make them its own using the Module **imports** and **mounts** logic.

Then, we'll dive into what exactly constitute a Hugo Module, how you can develop and maintain your own and ???

### Init the Module

Before you can import a repository and use its files, your project will need to be initiated as a Hugo Module. 

For this, you need to reference a repository. We'll assume your Hugo project already has a GitHub repo which lives at `https://github.com/me-me-me/my-repo`

EXAMPLE

```go-html-template
{{ with $term := .term }}
  {{ with index site.Taxonomies $taxonomy }}
    {{ with index . (urlize $term) }}
      {{ with .Page }}
        {{ $return = . }}
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}

{{/* 3. */}}
{{ return $return }}
```

Using the terminal for your project root directory:

```bash
hugo mod init github.com/me-me-me/my-hugo-project
```

☝️ The above when successful will generate a file called `go.mod` at the root. It should look something like the following:

```go-html-template
module github.com/me-me-me/my-hugo-project

go 1.14
```

It will also has created a `go.sum` file but you should not concern yourself with that one.

### Import a distant repository

For this very basic examples, we'll try and incoporate the icons made available by the Bootstrap team through their repo at [https://github.com/twbs/icons](https://github.com/twbs/icons).

Everything happens in your project `config.yaml` using the reserved `module` key and its `imports` array.

```yaml
module:
  imports:
    - path: github.com/twbs/icons
```

Now if you run `hugo` you will notice that your `go.mod` file got a new line.

```go-html-template
module github.com/me-me-me/my-hugo-project

go 1.14

require github.com/twbs/icons v1.0.0-alpha4 // indirect
```

That's good but it does not tell Hugo what to do with those files. 

With the `mount` key, attached to our Bootstrap import, will give Hugo more directions:

```yaml
module:
  imports:
   - path: github.com/twbs/bootstrap
     mounts:
     - source: icons
       target: assets/icons
```

Mounts are unlimited but for now we just added one with the following settings: 

- `source` param points to the location of the mounted files in the distant repo. Here we're pointing to the `icons` directory at the root of the repo.
- `target` param points to the location the files should be mounted into our Hugo's filesystem.

With that mount in place, you will be able to access the icons svgs just like any other files in your project:

```go-html-template
{{ with resources.Get "icons/cart.svg" }}
  <div class="fill-current w-4">
    {{ .Content | safeHTML }}
  </div>
{{ end }}
```

That's it! 

You can safely print this cart SVG without copying it to your project's directory. 

And in the off chance that this particular cart icon needs to be customized you can rely on Hugo's filesystem! 

All you'd have to do is create an homonymous icon file in your project at  `assets/icons/cart.svg` to have it being used in place of Bootstrap's own cart icon.

**or...**

We could even go crazier and use the icon from another distant repo just for that cart icon... 🤩

```yaml
- path: github.com/refactoringui/heroicons
    mounts:
    - source: src/solid/shopping-cart.svg
      target: assets/icons/cart.svg
- path: github.com/twbs/icons
	  mounts:
    - source: icons
      target: assets/icons
```

Notice: Note that regardless of the files mounted, Hugo will have to import/download the whole repository, so you might think twice before importing a 5MB repo for one of its svgs.

 

## Create a Hugo Module

The above was interesting as we covered how you can import any repo out there and make its files part of your project. 

But in the future you might want to create your own Hugo Module, full of template files and asset files and data files or even content files.

How to create and maintain your Hugo Module?

For the sake of the example, we'll create our own Icon Module. It will:

1. Import some SVG files from a distant repo
2. Create a page listing all available icons on the site.
3. Load its own `icon` partial which will find the right SVG file and print it on the page.

First we'll create a directory on our local machine. Let's say our Module will be poorly named `hugo-icons`.

### 1. Imports

The first thing we need is the `config.yaml` file for our Module to register our imports. Yes, not only Hugo projects can import Hugo Modules, even while being imported by projects, can import other Modules or repo themselves.

Our imports and mounts settings will be very similar to what we did before. We'll just mount the files in a reserved directory to make sure we don't have file conflicts with other modules.

```yaml
# config.yaml
module:
  imports:
   - path: github.com/twbs/bootstrap
     mounts:
	   - source: icons
	     target: assets/hugo-icons/icons
```

## 2. Creating the listing page

We'll need two things for that. 

1. A content files to be mounted on the project.
2. A template file for Hugo to render that content file as a page.

Thanks to the `mounts` settings, those files don't have to follow the usual directory structure of a Hugo project. They can live anywhere which makes sense in the context of our componentized module.

I'go crazy and add 

- `page/layout.html`
- `page/content.md`

And keep editing my `config.yaml` . There, you'll note that the `mounts` settings are at the root of `module` . That's because we are setting the mounting options of the module we're working with and not one of its imported module.

```yaml
# config.yaml
module:
  mounts:
    - source: page/index.md
      target: content/hugo-icons-listing.md
			lang: en
		- source: page/template.html
      target: layouts/_default/hugo-icons-listing.html
  imports:
   [...]
```

Note that the lang parameter only matters on multilingual site and even on those, omitting it will simply put the page under the default language site.

And now in those files:

```yaml
# page/index.md
---
title: Hugo Icons Archive
layout: hugo-icons-listing
---
```

```go-html-template
{{/* page/template.html */}}
{{ define "main" }}
	{{ range resources.Match "hugo-icons/icons/*.svg" }}
		<div style="fill:currentColor;width:3rem;margin:1rem 0">
		  {{ .Content | safeHTML }}
		</div>
	{{ end }}
{{ end }}
```

Notice: This will break if your project's or theme's baseof does not have a `main` block. We're just illustrating teaching here.

## .3 Adding the partial

I think the partial can live under the module's `partials/icons.html` and we'll register that new mount:

```yaml
# config.yaml
module:
  mounts:
    [...]
		- source: partials
      target: layouts/partials/hugo-icons
  imports:
   [...]
```

Note we'll mount it under a reserved directory so users can safely call  `{{ partial "hugo-icons/icon" "cart" }}` . This way we won't collide with another module having an `icon` partial.

And our very basic partial:

```text
{{/*
  icon
  Will print the icon matching the string passed as "context"

  @author @yourstruly

  @context String (.)

  @access public

  @example - Go Template
    {{ partial "hugo-icons/icon" "cart" }}

*/}}
```
```go-html-template
{{- with resources.Get (print "hugo-icons/icons/" .) -}}
  {{- .Content | safeHTML -}}
{{- end -}}
```

## Wrapping up our Module

It now provides the 3 features we set ourselves to. There's one critical thing missing from our Module's config though. 

We are using `resources.Match` which was introduced in Hugo 0.57.0. We should make sure no one using an older version can import our Hugo Icons Module or else... break!

```yaml
# config.yaml
module:
	hugoVersion:
		# We don't need extended (no sass)
	  extended: false
		# We don't have a max version
	  max: ''
		# We do have a min though.
	  min: '0.57.0'
```

This make sour finale `config.yaml` file:

```yaml
module:
  hugoVersion:
    min: '0.57.0'
  mounts:
    - source: page/index.md
      target: content/hugo-icons-listing.md
      lang: en
    - source: page/template.html
      target: layouts/_default/hugo-icons-listing.html
  imports:
    - path: github.com/twbs/icons
      mounts:
      - source: icons
        target: assets/hugo-icons/icons
```

## Versioning

## Release

## Developing a module (replace in the thing)

## Review CLI