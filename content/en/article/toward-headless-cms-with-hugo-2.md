---
draft: false
authors:
  - persons/regis-philibert.md
date: 2021-12-20T08:32:27.000Z
title: "Toward using a Headless CMS with Hugo: Building Pages from an API"
slug: toward-using-a-headless-cms-with-hugo-part-2-building-from-remote-api
tags:
  - hugo
  - headless-cms
  - api
  - JAMStack
subjects:
  - dev
description: Hugo is yet to support building pages from data, but there is a workaround! In the first part of this series we explore the concept of hacking Hugo into building pages from local data.
seo:
  image: /uploads/toward-headlesscms-with-hugo-part-1.png
---

[Ealier this year]({{< relref toward-headless-cms-with-hugo-1 >}}), we covered one workaround which allowed us to circumvent Hugo limitation on building pages from data.

This time we'll use another workarkound, much more straight forward, but most importantly we'll grab our data from a remote source using `resources.GetRemote` --- Hugo's own `fetch` API --- and build a Hugo project with it. List, Pages and all!

## Building pages from a remote source

With Hugo's famous limitation, the only way to efficiently build pages from data (local or remote) while preserving the powerful Page API of Hugo has been to split your build into two steps.

__Step 1__ uses whatever script and tooling you're comfortable with to fetch the remote data and generate markdown files to feed to Hugo.

__Step 2__ simply runs a Hugo project using the markdown files generated during __Step 1__.

There are lot of ways to implement __Step 1__: Netlify, for instance, has a "build" plugin solution you can run before your build. It is currently limited to NodeJS and requires jumping through several hoops when building locally, but is an option.

CloudCannon on the other hand reads a `prebuild` file on your repo which can include any script to be run before the build.

All of this is good and all, but what if I told you that Hugo, in itself, while not able to build pages from data is perfectly capable of:
- Fetching and API and process its response.
- Write markdown files.

So Hugo can very well run both steps!

In this article, we'll see how we can safely use the same Hugo binary to run __Step 1__ and __Step 2__ and have Hugo and Hugo alone build pages from a remote source.

## The project

Remember our MonsterSpotting site from earlier? It was relying on a data file to build its pages. Well from now on, it will ping an API located at https://monsters-api.netlify.app/ to retrieve its monsters, and create pages from it.

### Prerequisite

You should have Hugo `0.91.0` running.

{{% aside %}}

__Hugo to generate content files, isn't there a better tool for that?__

Always up for debate but we've tested this with 10,000 entries fetched from a paginated API (100 pings) and had the 10,000 markdown files built and written in 2 seconds. So speed is not a problem even if this runs on every build.

The only preferable solution could be a Go script of course, but you will need to carefully choose your CI in order to set it up properly and, you need to know Go. 

The advantage of running Hugo here is that you are using the same framework that you know well and benefit from its caching logic for the endpoints. There is no extra setup: just one more configuration file and one more template file.
{{% /aside %}}

## Step 1

We need to configure a minimal Hugo project. This is the project which will just get the monsters data and write the markdown files.

We could use the root directory of the main project, but it's much more convenient to use a sub directory. 

Let's create a `prebuild` directory to handle everything "pre-build".

In your terminal you can already `cd` into this directory as you'll have to run `hugo` from there throughout __Step 1__.

### Our files

For Hugo to build a project, it only needs two files. We'll add those.
1. `prebuild/config.yaml`
2. `prebuild/layouts/index.html`

### Configuring our minimal project

Technically an empty `config.yaml` would be okay, but while we're at it, we can pass some settings to make sure Hugo does not output too many useless files likes `/categories/index.html`, `/tags/index.html` or the `sitemap.xml` etc...

```yaml
# config.yaml
disableKinds:
- sitemap
- taxonomy
- term
outputs:
  home:
  - html
```

### Fetching the remote data

First let's look at what our endpoint at `https://monsters-api.netlify.app/` returns to get an idea of what we'll be getting.
```json
[
  {
    "id": "bryan-plastic",
    "league": "Teal",
    "title": "Bryan Plastic",
    "spotted": "Gandara",
    "svg": "<?xml version=\"1.0\" encoding=\"utf-8\"?>..."
    "content" "Liberos egestas culus sque nuncves cras roin. Aliquet..."
  },
  {
    "id": "gus-vinyl",
    "league": "Fuscia",
    "title": "Gus Vinyl",
    "spotted": "Reserva",
    "svg": "<?xml version=\"1.0\" encoding=\"utf-8\"?>..."
    "content": "Consect sapien nequenu lisis portamor rutrumnu nisimor lus malesu risque. Ibulum molestie...
  }
  [...]
]
```

{{% notice %}}
There are various settings this `resources.GetRemote` can use like "headers" (useful for authorizations) or `method` and `body`. It also sports a `.Err` method to check for errors. Now our monsters API is not too shy, we won't need to get into any of this just yet. A simple URL will do.

{{% /notice %}}

__Looks good? Let's start fetching!__

We'll now focus on our minimal project's `layouts/index.html`. Hugo will only have one template to read, but for what we're trying to achieve it's plenty.

This template file will be in charge of fetching the API data, ranging on the returned monsters and create the markdown files.

Since Hugo 0.91.0, you can fetch remote resources using `resources.GetRemote`.
Here we're looking for a JSON response, but bear in mind you could fetch images, documents, svgs, anything out there is yours to get and manipulate with Hugo's [resources feature](https://gohugo.io/hugo-pipes/).


Let's dive in with this very basic piece:


```go-html-template
{{/* prebuild/layouts/index.html */}}
{{ with resources.GetRemote "https://monsters-api.netlify.app/" }}
  {{ $monsters := . }}
{{ end }}
```

With the code above, we are able to retrieve our Monsters. 


But that will not be enough, the `$monsters` variable does not contain a list of monsters yet, for now it's just a resource, a file which has been fetched. The content of the response, in our case ~500 monsters trapped in an jsonified array is available at `.Content`.

And in order to turn this json string into an array (or slice) Hugo understands, we'll use the `transform.Unmarshal` function, aliased `unmarshal`. This take any string, `json`, `yaml` or `toml` and turns it into "Hugo data".

One more time:

```go-html-template
{{/* prebuild/layouts/index.html */}}
{{ with .resources.GetRemote "https://monsters-api.netlify.app/" }}
  {{ $monsters := unmarshal .Content }}
  {{ range $monsters }}
    I love {{ .title }}
  {{ end }}
{{ end }}
```

Now we know how to handle our response and turn into data we can use in templates! But while do love our monsters, proclaiming our love is not the point here. We want to create files, markdown files!

### Create the markdown files

What we now want to do for each monster, is use the retrieved data to create a markdown file. 

For this we'll use the Hugo Pipes `resource.FromString` method. What it does is take a string, and generate a Hugo resource from it at the desired destination.

```go-html-template
{{ $love := resources.FromString "monsters/love.txt" "I love Monsters" }}
```
The above will create a resource with "I love Monsters" for content, and `monsters/love.txt` as a filename.

But it will not publish it, if you're familiar with Hugo Pipes, you'll know that anything it produces will only be published if its `.RelPermalink` or `.Permalink` method is invoked.

```go-html-template
{{ $love := resources.FromString "monsters/love.txt" "I love Monsters" }}
{{ $file := $love.RelPermalink }}
```

That extra line will be enough for Hugo to publish it and won't print anything, as we're storing it in a variable.

Now, finally, on to creating markdown files!

This is a conventional markdown file using YAML:

```yaml
# monsters/gus-vinyl.md
---
title: Gus Vinyl
league: Fuscia
spotted: Reserva
id: gus-vinyl
---
```

We could spend a bit more time formatting something like that, but Hugo also supports `json` as Front Matter. A JSON Front Matter markdown file's content is just a JSON object followed by the content:

```json
{"id":"gus-vinyl","league":"Fuscia","title":"Gus Vinyl","spotted":"Reserva"} Lorem ipsum monster yaya...
```

For now, our monsters content will be stored as Front Matter key, easy then:

```go-html-template
{{/* prebuild/layouts/index.html */}}
{{ with resources.GetRemote "https://monsters-api.netlify.app/" }}
  {{ $monsters := unmarshal .Content }}
  {{ range $monsters }}
    {{/* 1. */}} {{ $string := jsonify . }} 
    {{/* 2. */}} {{ $filename := printf "monster/%s.md" (urlize .title) }} 
    {{/* 3. */}} {{ $resource := resources.FromString $filename $string }} 
    {{/* 4. */}} {{ $file := $file.RelPermalink }} 
  {{ end }}
{{ end }}
```
1. We create the JSON version of our monster
2. We create its filename by urlizing its title and using `printf` to include a directory
3. We generate the markdown resource using `resources.FromString`
4. We make sure it's published.

That's it? That's it!

Now we can run `hugo` from the `/prebuild` directory:

```bash
my-computer:remote mememe$ hugo
Start building sites … 
hugo v0.91.0+extended darwin/amd64 BuildDate=unknown

                   | EN  
-------------------+-----
  Pages            |  0  
  Paginator pages  |  0  
  Non-page files   |  0  
  Static files     |  0  
  Processed images |  0  
  Aliases          |  0  
  Sitemaps         |  0  
  Cleaned          |  0  

Total in 1057 ms
```


As you can seem Hugo did not build any pages per say but we should get a fresh `remote/public/monster` directory full of monsters!

And just like that, we've wrapped up __Step 1__!

## Step 2.

This will be much easier. Let's `cd` back one directory, up to our main project.

### Configuring our main project

First, for Hugo to read the markdown files from below, we need to mount the `prebuild/public/monsters` directory into our project. For this we head to our project's module config and update its mounts settings:

```yaml
# config.yaml
module:
  mounts:
  - source: content
    target: content
  - source: prebuild/public/monster
    target: content/monster
```

{{% notice %}}
With a mount target on a sub directory it's always safer to redeclare the mount of its parent. Hence our fist content > content mount.
{{% /notice %}}

Now on our main project, we just need to make sure our templates are using the proper Front Matter keys.

For example our `layouts/monster/list.html` will look like that:

```go-html-template
{{ define "main" }}
  {{ range .Pages }}
  <h1>{{ .Title }}</h1>
  <p>{{ .Title }} was spotted in {{ .Params.spotted }}</p>

  {{ .Params.svg | safeHTML }}

  <div class="content">{{ .Params.content }}</div>
  <hr>
  {{ end }}
{{ end }}
```
Tada!

If you have already ran `hugo` from the `prebuild` direrctory, you can safely run `hugo serve` from the main one, and see how ours monsters look.

## Step 1 && Step 2

Running both builds locally can be okay, but we need to make sure this will be viable in the cloud, when our site is built by a CI.

As we covered lengthily we need to run it from the `prebuild` directory first and then the main one. 

Rather than runing a simple `hugo`, we need to navigate a bit:

```bash
cd prebuild && hugo && cd .. && hugo
```
☝️ That will do it!

#### CIs.

The great advantage of this is you don't need to wonder how your CI will handle the two steps, you just need to update the build command to navigate your directories.

For Netlify for example your `netlify.toml` will look something like this:

```toml
# netlify.toml
[build]
publish = "public"
command = "cd remote && hugo && cd .. && hugo"
```

#### Caching

Do we really want to fetch our API everytime the site builds? Depending on the API, you could of course, and writing the files should always be very fast.

But it's always good to know your options.

For the API, Hugo has a nice `caches` settings which allows to control how long any given URL's repsonse should be cached. With

```yaml
# prebuild/config.yaml
caches:
  getresource:
    maxAge: 6h
```

We are effectively informing Hugo that this any endpoint used with `resources.GetRemote` should not be fetched again until 6 hours have passed.

## A few more things!


### Data transformation

The data from our Monsters is easy to handle but you'll mostly want to transform the data from the API into something more aligned with your project. In a future article we'll cover everything there is to know about the way to manipulate data with Hugo. 

That will allow us to create transformers for our data and prep those markdown files nicely!


### Adding .Content
What about `.Content` and how can we make the generated files look good?

Front Matter --- in our example, a simple json object --- goes first, the body comes second. So translated into Hugo:
```go-html-template
{{ $string := print (jsonify $monster) $monster.content }}
```
Then you've got a complete Markdown file with a content handled in the template via `.Content`.

### Other Front Matter than JSON?
Again, in this modest example we're using a json string because in most cases you won't need a fancy formatting for your "imported" markdown files. After all, there are for Hugo eyes only... 

But in the offchance that you do, you could use: [`resources.ExecuteAsTemplate`](https://gohugo.io/hugo-pipes/resource-from-template/#readout). This useful resource method will take a filepath destination as first argument, a context as second and the template's filepath to use as third.

For yaml you could create a `/remote/assets/monster.yaml` file like so:
```go-html-template
---
{{ range $key, $value := . -}}
{{- if ne $key "content" -}}
{{- $key }}: {{ $value }}
{{ end -}}
{{- end -}}

---

{{ .content }}
```

And update the file creation in your `remote/layouts/index.html` to:
```go-html-template
{{ $yaml_template := resources.Get "monster.yaml" }}
{{ $file = resources.ExecuteAsTemplate $filename $monster $yaml_template }}
```

## See in action

All code examples are located in this repo:

It's running Tailwind and PostCSS, so you might need to hit `npm install` before playing!