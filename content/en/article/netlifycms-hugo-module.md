---
title: NetlifyCMS and Hugo, a Module
draft: true
date: 2020-06-22T17:33:58.363Z
authors:
  - persons/regis-philibert.md
---

A couple of months back, we decided, at theNewDynamic to try Netlify CMS and see how well it could fit in our various processes and methodology. Early in our trials we realized some issues would need to be addressed before even considering setting up one of our sites with it.

The results of our journey have been put into an open source Hugo module that anyone can now mount to their Hugo project to instantly setup the CMS on their website.

In this article we'll go through the obstacles encountered, and how we managed to overcome them and package the result in a reusable Hugo Module before finally going through how easy it is to use the module on your project and benefit from Netlify CMS.

This article is about the how and why of [theNewDynamic's NetlifyCMS Hugo Module](https://github.com/theNewDynamic/hugo-module-tnd-netlifycms)

## Why Netlify CMS?

Netlify CMS as a Git based CMS brings a lot of advantages. 

1. **Free and Open Source.**
Netlify CMS is free and fully open source. We could stop here really, but there ar other perks.
2. **It is an application running on top of your website.** 
This means the CMS is hosted right along your website without any external dashboard.
3. **You can fully set it up and develop locally.**
Often, while developing a new editorial feature, you need to test the saving behaviour of the CMS. In this process you don't want to create noisy commits on your repo, or setup the CMS on yet another remote testing branch. By being able to run the CMS 100% locally, you avoid the aforementioned problems.
4. **You can customize a lot.**
To create your own field types (widgets) or previews of given fields or pages in the CMS, all you need is some React nerdiness which, let's be honest these days, is a pretty accessible commodity.
5. **You don't need a bundler.**
You can use one of course, but if you like to keep your pipeline minimal, Netlify CMS won't be a burden.

## The Concept of Netlify CMS

Netlify CMS is a single page webapp that can be published anywhere on the web. It requires two things:

1. An HTML endpoint for the webapp to mount the CMS Dashboard. The short HTML code is provided on [their documentation page](https://www.netlifycms.org/docs/add-to-your-site/#app-file-structure).
2. A `config.yaml` file with all the CMS settings living alongside the above HTML page.

## The Problems of Netlify CMS

For Hugo, assuming you want your CMS under the same domain as your website, it usually means dropping the two files in your `/static` directory. 

This is great and looks easy at first, but we quickly ran into critical issues:

1. That landing page living in the static directory would be problematic. Moving files around to control a simple URL is not good. Plus that HTML and its CDN calls could come to evolve, and all of a sudden we'd have to manually update dozens of static files across our many repos.
2. As we'll cover in detail later, creating and maintaining that hardcoded deep level configuration file was a no go for us.
3. Having to rely on anything other than Hugo Pipes to bundle, babel and minify the neatly structured JS files we'd maintain to fully benefit from Netlify CMS [customization](https://www.netlifycms.org/docs/custom-widgets/) was another big "no no"!. 

## The Solutions through Hugo

### 1. The CMS Dashboard HTML File

Making the CMS landing page part of our Hugo content structure and template logic, rather than leaving it static, meant we could now control most aspects of the app with a regular content file and a matching template file. 

The page would use the default URL matching its position in the content directory or a custom URL assigned through Front Matter or any other available Hugo permalink settings. This meant on any given project, we could update the CMS access from `/cms` to `/private/content` or `/editors` without moving a single file.

As we also controlled the template file used to build the page, some per-project settings, like Netlify CMS version, could be used to dynamically build the CDN url passed through the script tag.

As we controlled the creation of any scripts passed to the page, anything we needed to benefit from the CMS' [great flexibility](https://www.netlifycms.org/docs/custom-widgets/) could be bundled, Babeled and minified by [Hugo Pipes](https://gohugo.io/hugo-pipes/introduction/).

And because, everything is packaged in a reusable unit, any optimization or update to the Netlify CMS provided HTML code could be maintained throughout all of our projects by simply updating the said Module.

### 2. The CMS Configuration File

Netlify CMS in its current implementation requires users to configure its many collections and fields through the `yaml` file which is then published alongside the CMS landing page. 

[YAML](https://yaml.org/) is a very easy to read "indentation" based configuration language but it does not allow imports or functions. It can therefor become pretty difficult to maintain when the data runs big **and** deep. 

Netlify CMS, through this configuration file, lets you add collections of entries (posts, pages, recipes etc... in your sidebar), for which you can add dedicated fields, many of which will be reused across several collections. 

Some field types or "[Widgets](https://www.netlifycms.org/docs/widgets/#default-widgets)", like `List` or `Object` can hold their own list of fields of any type, thus lifting all restrictions to the level of depth your `yaml` file can potentially reach.

For example, [here >](/cms/config.html) is the `yaml` file generated by our very Module on this very site. It's pretty simple for now, yet imagine having to write, read and maintain that yourself.

We quickly realized that if we wanted to adopt Netlify CMS on our sites and our clients', moving the CMS landing page to a content file was not enough. 

We had to tackle this important configuration file maintaining issue. And we had to do it in a reusable and as always open source way. 

We needed:

- The ability to componentize data objects like common used field types into their own file for ease of maintaining.
- **The ability to reuse given data objects anywhere and at any level in the configuration structure.**

To achieve both goals, we made use of the very intuitive [Data file system](https://gohugo.io/templates/data-templates/#the-data-folder) of Hugo to store our reusable data sets and added a new [Custom Output format](https://gohugo.io/templates/output-formats#readout) which would generate the `config.yaml` endpoint alongside the CMS landing page.

This allowed us to let Hugo, by reading the users' data files, handle the generating of the `config.yaml` file to be fed to Netlify CMS.

And now that we had Hugo in full control of the processing and the outputting of the file, we could introduce a very simple UX to **import** data sets rather than constantly having to copy/paste them. 

For example, we could now add anywhere in the configuration structure — in place of an array entry — a simple string: `- import field title` which would point to the data found in `data/netlifycms/fields/title.yaml`.

With this, Hugo could simply browse the data files down through their deepest level and recursively replace each import statement strings found in an array with the data set stored in the matching data file.

This makes our Netlify CMS configuration file much easier to read and maintain as you can see in the set of examples below.

#### Data files examples

First the root `config` file from our `/data/netlifycms` directory.

```yaml
#data/netlifycms/config.yaml
backend:
  name: git-gateway
media_folder: static/uploads
public_folder: /uploads
collections:
- import collection pages
- import collection articles
- import collection persons
```

As you can see it imports, among others, the *articles* collection. Let's jump to its matching data file:

```yaml
# data/netlifycms/collections/articles.yaml
name: "articles"
label: "Articles"
description: Yes we also write blog posts.
folder: "content/en/article"
create: true
fields:
  - import field title
  - import field date
  - {
      label: "Description",
      name: "description",
      widget: "markdown",
      required: false,
    }
  - import field body
```

☝️ Note that import statements and regular `yaml` object can perfectly co-exist.

As you can see it imports, among others, the very often used *title* field whose data file reads as such:

```yaml
# data/netlifycms/fields/title.yaml
label: "Title"
name: "title"
widget: "string"
```

#### Recursive you said?

Yes as long as one data set does not import itself, you can have as deep a level of imports as needed.

### 3. The Customization Scripts

First a few words on Netlify CMS customization. 

You can, by using React components mount on the CMS any custom Widgets, meaning custom field types. Let's say your project needs a dedicated color picker. You can build that and assign it to any field. 

You can also very easily customize how the CMS will preview any given page, or even field, or even rendered markdown (image, link etc...) for your editor. These are custom previews. 

All of those are React components to be loaded after the initial Netlify Script.

As we're dealing with a CMS Dashboard page here, which is only accessible to a limited few, performance optimization are not heavily critical.

Furthermore, to limit the number of requests we decided to follow Netlify CMS documentation suggestion  and simply print our scripts in a `script` tag. After all this is a one page webapp, all of this would be read once.

Now this does mean all our scripts had to be written inside the HTML template file. That could potentially mean hundreds of lines to be maintained from within one file... nope. 

Luckily, [Hugo Pipes](https://gohugo.io/hugo-pipes/) can [bundle](https://gohugo.io/hugo-pipes/bundling/) files for us! So by using our very own Module, we could now store all of our custom widgets and custom previews components into Hugo's dedicated `asset` directory and let Hugo bundle them, and print the minified result in the script tag.

Every component in its place, waiting to be bundled and served!

```text
assets
└── netlifycms
    ├── editor
    │   └── youtube.js
    └── preview
        ├── articles.js
        └── persons.js
```

But that's not enough. Building a React component without `jsx` can quickly become a bit of a bore.

Guess what? Hugo [can now use Babel >](https://gohugo.io/hugo-pipes/babel/) our files 🤩 !

So, bundle them, babel them and print the minified result in a script tag!

## The Solutions, packaged.

Solving those problems was great, but that solution could not be kept for one project alone, and certainly not for ourselves alone. Just like any problem solver, we had to use it on multiple projects, and therefore package our approach in a reusable, and easily configurable unit. 

For us Hugo users, it means, a Hugo Module. 

For us Hugo enthusiasts, it means a open source Hugo Module.

The resulting Hugo Module aims at the following: 

**Publish the two files required by Netlify CMS while giving full control to potentially non-coding users though a very simple data file based UX.**

[theNewDynamic/hugo-module-tnd-netlify-cms](https://github.com/theNewDynamic/hugo-module-tnd-netlify-cms)

## Using the Module

Let's see how easily you can add the module to your project, setup the Dashboard page, setup your configuration and eventually benefit from Netlify CMS customization.

### Adding the module to the project

Mounting the module on your project is as easy as adding one import to your `module` config settings on your project configuration file:

```yaml
# /config.yaml
module:
  imports:
    - path: github.com/theNewDynamic/hugo-module-tnd-netlify-cms
```

{{% notice %}}
For local development you will also need the [netlify cms package](https://www.npmjs.com/package/netlify-cms)
{{% /notice %}}

### 1. Setting up the Dashboard

If your CMS Dashboard were to live under `ourwebsite.com/cms`, then you'd simply have to add a content file at  `content/cms.md`.

Such content file will need a few Front Matter keys to ensure Hugo uses the right template files for both your CMS landing page and configuration file.

```yaml
# content/cms.md
---
title: CMS
type: netlifycms
outputs:
  - HTML
  - netlifycms_config
---
```

As the page works as any other Hugo content page, its location or permalink configuration determines the URL with which your editors will access the CMS.

If you need it to live under a directory but do not want to bother with creating said directory in your content structure, you can use Hugo's `url` settings.

```yaml
---
title: CMS
type: netlifycms
# custom url
url: private/content
outputs:
  - HTML
  - netlifycms_config
---
```

### 2. Configuring the CMS

Everything Netlify CMS happens under a reserved data file directory called `/netlifycms`. Create the directory and add a `data/netlifycms/config.yaml` file.

This file should contain the basic configuration plus your collections. The point is not to have too many `yaml` glyphs in there, so using the import statement on collections is a great start.

The import UX is limited to two types of data for now, `collections` and `fields`.

- `import collection persons` => `data/netlifycms/collections/persons.yaml`
- `import field persons` => `data/netlifycms/fields/title.yaml`

The first section of the article includes several [detailed examples of data files](#data-files-examples) using the import statements.

### 3. Customizing the CMS with Hugo processed scripts.

In itself, the module will not build your obviously very unique Netlify CMS Script Pipeline. But it will pick any partial from your project named `layouts/partials/tnd-netlifycms/scripts.html` and add its output to the landing page template, after the Netlicy CMS base scripts and CDN calls.

Let's review a code example for that Netlify CMS partial very similar to the one we use on this very website. We'll discuss numbered comments afterwards.

```go-html-template
{{/* layouts/partials/tnd-netlifycms/scripts.html */}}
{{ $style := false }}
{{/* 1. */}}
{{ with resources.Get "css/style.css" }}
  {{ $style = . | resources.PostCSS }} 
{{ end }}
<script type="application/javascript" src="https://unpkg.com/react@16.0.0/umd/react.production.min.js"></script>
<script>
  {{ with $style }}
	{{/* 2. */}}
  CMS.registerPreviewStyle("{{ $style.Permalink }}");
  {{ end }}
	{{/* 3. */}}
  {{ with resources.Match "netlifycms/**/*.js" }}
		{{/* 4. */}}
    {{ $bundle := resources.Concat "netlifycms.js" . }}
		{{/* 5. */}}
		{{ $bundle = $bundle | babel (dict "config" "babel.config.json") }}
		{{/* 6. */}}
    {{ $bundle.Content | safeJS }}
  {{ end }}
</script>
```

1. We want our full CSS file to be used by Netlify CMS to render our previews. This way, we can use our own Styleguide's class names in the Preview Components templates.
2. Having processed the style, we pass it through the Netlify CMS's method.
3. We want to componentize our React component files. Here we're looking through our own reserved directory from within the project's `assets` directory where they're all [neatly structured](https://github.com/theNewDynamic/thenewdynamic.com/tree/master/assets/netlifycms).
4. We bundle all those assets into one unpublished file.
5. As we're using `jsx` to template our React components, we'll use the newly added Babel [Hugo Pipe](https://gohugo.io/hugo-pipes/babel/) to compile our bundle for browsers. This requires `@babel/cli`, `@babel/core`, `@babel/preset-react` as devDepedencies and a simple [`babel.config.json`](https://github.com/theNewDynamic/thenewdynamic.com/blob/main/babel.config.json) file in your project.
6. We simply print the content of the unpublished file inside our `<script>` . We could also publish the file and call it as request. To each their own.

That's it! Now you can look through the Netlify CMS doc, and add some nifty WidgetPreview React component like this [one](https://github.com/theNewDynamic/thenewdynamic.com/blob/main/assets/netlifycms/preview/persons.js).

## Conclusion

Netlify CMS is an excelent choice for a git based CMS but adding it on a Hugo project can prove cumbersome on large projects. By identifying the problems and creating a reusable packaged Hugo Module with their satisfying resolutions, we felt we were ready to start adopting and recommand Netlify CMS.

We tried to lay out the journey through this article and introduce the said Module and its minimal installation steps so other could benefit from Netlify CMS, Hugo and theNewDynamic's modest contribution to this promissing coupling!