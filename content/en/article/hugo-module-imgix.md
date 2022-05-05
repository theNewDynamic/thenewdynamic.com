---
authors:
  - persons/regis-philibert.md
featured: /uploads/hugo-module-imgix.png
date: 2021-01-18T9:32:27.000Z
twitter_description: |- 
  We love @imgix but in order to fully integrate this amazing image optimization service into our everyday workflow, we had to solve some problems! The solution came in the form of an open source @GoHugoIo Module! 
  This article is about the whys-and-hows of TND's Imgix Hugo Module.
  
  #ssg #imgix #hugo #modules
title: "imgix Hugo Module"
slug: hugo-module-imgix
tags:
  - hugo
  - modules
  - JAMStack
  - imgix
subjects:
  - Code
description: Imgix is image manipulation and optimization service we often lean on to for projects. We had to solve a few problematics before we could fully integrate it in our everyday workflow! The anwser came as a reusable and fully distributable Hugo Module. This article is about the whys-and-hows of TND's Imgix Hugo Module.
---

Recently we published an [article]({{< relref "/hugo-modules" >}}) about Hugo Modules. They are now essential to our Hugo projects and in the course of the past year we've been building many. Every Module we code is the result of a careful thinking on a particular issue and its satisfactory solution packaged in an easily maintainable and distributable code bundle.

Today we are debuting a series of articles detailing the thought process behind some of our Hugo Modules, starting with one which help integrate a very popular service to any Hugo project: __imgix__.

imgix is an image manipulation and optimization service that we rely on extensively in our work and has been part of the Jamstack ecosystem since the early days. It's a great way to leverage simple or even complex image processing on your projects and benefit from their optimized CDN.

We use imgix on many of our projects because it perfectly answers our image transformation concerns.

As for any service, there are issues large and small to address before we can safely integrate it into our process. And of course, once such problems are solved, we had to package the solution into a publicly distributed Hugo Module. 

This article is about the whys-and-hows of [theNewDynamic's IMGIX Hugo Module](https://github.com/theNewDynamic/hugo-module-tnd-imgix)

## Why imgix?

Imgix as a tier image CDN and transformation API brings many advantages:

1. **Remove bandwidth concern from your host.**
Imgix will download your image once from your host, and then serve it itself for a period of time, thus eliminating most image bandwidth on your end.
2. **Remove image transformation concern from your front-end team.**
Image transformation is hard and it's not just for sizing, filtering and cropping. It also means optimizing your images formats to better serve them, such as automatically serving the "Webp" format to browsers who recognize it. With imgix's transformation [API](https://docs.imgix.com/apis/url), your concern is limited to appending query parameters to a URI.
`https://imgix.tnd.com/image.jpg?w=400`
3. **Remove caching concerns from your DevOps team.**
The whens-and-hows of caching is a lot of work, which requires constant attention and fine tuning! Imgix takes care of that that for you, while still leaving you in control.

## The problems

> With imgix's transformation API, your concern is limited to appending query parameters to a URI.

It reads easy enough, but when you have to build those URIs for a wide variety of images in your templates, as well as safely include custom parameters on top of the ones we should always use, this can be more cumbersome than it sounds.

We need:

1. **To reference the imgix domain once**. 
And use throughout...
2. **API mapping.** 
 `w` will transform the width and `h` the height, those are intuitive enough but others aren't as much. Our coders should just use `width` and `height` when passing transformations and do not concern themselves with the imgix API documentation. Of course we needed to be able to customize this mapping for any given project.
3. **Some default transformations to apply on every image URI.**
Client hints and auto enhancements are usually applied to every images, but some projects might need others. 
4. **Restrict some extensions.** 
Sometime from the comfort of a CMS, one might upload a PDF when your template expects an image. We needed to control which extensions could receive transformations.
5. **A single function which would build that imgix source URI.** 
We needed one function to build all our URIs. It would take a relative or absolute image location alongside a map of transformation parameters.

**Bottom line, we should be able to answer the five requirements above and print the following:**

```go
https://tnd.imgix.net/thumbnail.jpg?auto=format&ch=Width%2CDPR&lossless=true&q=75&w=300
```

## The solutions

**settings, settings, settings, settings, function!**

Most problems here we'll be solved through settings. To ensure the module's settings don't conflict with something else, we should store them under a reserved key in the project's own `params` map.

### 1. imgix domain

Whenever the URIs will be built we'll incorporate the imgix domain as set per the user.

```yaml
params:
  tnd_imgix:
    domain: tnd.imgix.com
```

We'll omit the `params` key from now on and assume we're working directly from `config/_default/params.yaml` (What? Wait! 👉 [here](https://gohugo.io/getting-started/configuration/#configuration-directory))

### 2. API Mapping

Any given user can set a mapping that matches their most commonly used API parameters. The **key** is the chosen keyword, the **value** is the API's own reference. 

```yaml
tnd_imgix:
  mapping:
    max-width: max-w
    halftone: htn
    hints: ch
```

### 3. Defaults transformations

At The New Dynamic, among others, we like to apply a quality of `95` (for a practically unnoticeable change in quality, but a noticeable improvement in file size) and client hints to screen width and DPR (Device Pixel Ratio) on all of our imgix served images.

By grabbing those settings before building any URI query, we ensure it's applied on top of the parameters requested while remaining "overwritable" if needed.

Of course, we should be able to use our own API mapping keywords defined above when setting defaults, because... why not?

```yaml
tnd_imgix:
  defaults:
	  hints: Width,DPR
		q: 95
```

### 4. Restrict extension

Through settings we can limit transformations to some extensions. This way imgix won't have to resize and rework cat and cucumber animated gifs... 🙀🥒

```yaml
tnd_imgix:
  allowed_extensions:
  - jpg
  - png
```

### 5. The function

Now we need a function to consume those settings and return the proper imgix URIs topped with on-demand API parameters.

We'll need to send down two sets of information to our function:

**The image location**

The critical and required information will be the location of the image. It should always be a string referencing the image location. It can be:

- relative to set imgix domain: `/ulpoads/thumbnail.png`
- absolute with set imgix domain: `https://tnd.imgix.com/uploads/thumbnail.png`
- absolute without the set imgix domain: `https://amz.bucket.tnd/uploads/thumbnail.png`

Of course with the latter, the function will just return the passed location without any processing. 

**The transformation parameters**

These will be the API parameters and values using our mapping settings.

Now with Hugo, we don't think in terms of `functions` as much as partials, and we'll be using a [returning partial](https://regisphilibert.com/blog/2019/12/hugo-partial-series-part-2-functions-with-returning-partials/) to process the information and return the URI.

As partials only take one parameter or context, we'll allow two types of those. 

- A **string**. If the context is a string, the partial will assume it's the **image location** and that no transformation beside the default ones are to be applied.
- A **map** — object. If the context is a map, the partial will look for the `src` key's value to isolate the **image location**, and will treat the rest of the key/value pairs as mapped imgix API parameters.

Taking into account the configuration examples for the **domain**, the **mapped API keys**, the **defaults** and the **allowed extensions** from before, the following use cases would return as follow.

```go
{{*/ 1  Context is a string /*}}
{{ $src := partial "tnd-imgix/GetSRC" "/uploads/image.jpg" }}

{{*/ 2 Context is a map /*}}
{{ $src := partial "tnd-imgix/GetSRC" (dict "path" "/uploads/image.jpg" "max-width" 500 "halftone" 11) }}

{{*/ 3 Context is a map but an animated gif made its way in! 🤦‍♂️ /*}}
{{ $src := partial "tnd-imgix/GetSRC" (dict "path" "/uploads/cat-cucumber.gif" "halftone" 11") }}

```

👇

```go
// 1
https://tnd.imgix.com/uploads/image.jpg?auto=ch=Width,DPR&q=95

// 2
https://tnd.imgix.com/uploads/image.jpg?auto=ch=Width,DPR&q=95&max-w=500&htn=11

//3
https://tnd.imgix.com/uploads/cat-cucumber.gif
```

## Solved!

Thanks to Hugo Modules and a little bit of head scratching we now have a consistent and easily maintainable and improvable solution to use a great service like imgix!

Next time one of our project, or yours, will need imgix, all we'll have to do is import the module, add our own domain and settings, and use the one partial detailed above!

Also, everytime we'll implement a new feature to improve the module, all our projects using it will benefit from it by simply hitting the upgrade flag from Hugo Modules' CLI `hugo mod get -u github.com/theNewDynamic/hugo-module-tnd-imgix`

### Take it for a spin!

Make sure your project is `init` as a Hugo Module [as documented here]({{< ref "article/hugo-modules.md#init-the-project-as-a-module" >}}) and list the module as one of your project's imports.

```yaml
# config.yaml
module:
  imports:
  - path: github.com/theNewDynamic/hugo-module-tnd-imgix
```

Then use the settings and code example above and start using `tnd-imgix/GetSRC`

For anything more, head to the [repo](https://github.com/theNewDynamic/hugo-module-tnd-imgix).