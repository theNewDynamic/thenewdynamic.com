---
draft: false
authors:
  - persons/regis-philibert.md
date: 2021-06-24T08:32:27.000Z
twitter_description: |-
  .@GoHugoIO is yet to support building pages from data/api, but there is a workaround!
  
  In this two part series, while building a fun monsterspotting site, we detail how you can already start exploring building pages from data with Hugo.

  👾 #gohugo #JAMStack #ssg
  https://www.thenewdynamic.com/article/toward-using-a-headless-cms-with-hugo-part-1/
title: "Toward using a Headless CMS with Hugo: Building Pages from Data"
slug: toward-using-a-headless-cms-with-hugo-part-1
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
In the fist part of this series, we covered one workaround to allow building pages from a data source.

Now we're going to cover another more straight forward workaround, but most importantly we'll grab our data from a remote source using `resources.GetRemote`, Hugo's own `fetch` API.


## TL;DR: The other work-around

Last time we used taxonomies to induce Hugo into generating pages. This time we'll just generate them ourselves!

But how? I thought Hugo could not build pages from data?

It cannot, but it can create markdown files thanks to the Hugo Pipe API. This is what we use to create build javascript files, styles and more. But contrary to Hugo itself, this feature does not need a file to output another one, it can take a string with `resources.FromString` and generate a file from that. 

Let's say that string is the json representation of an API entry, and it's filepath ends with `.md`... As Hugo supports json as Front Matter, yep... you've got yourself a content file.

So! We'll have to run two Hugo Projects.

1. First a very minimal one, so tiny you can safely store it in your repo. One config file, and one template file! It will fetch our data from an API with `resource.GetRemote` and using `resources.FromString` produce a markdown file for each of them at our desired location.
2. Second, the main project! With the proper configuration it will mount the markdown files outputted by 1. and build pages form it!

That's it! Finally, pages from a remote source built by Hugo.

**That's it for the concept! Let's dive in!**

ASIDE

Hugo to generate content files, isn't there a better tool for that? We've tested this thing with 10000 entries fetched from a paginated API (100 pings) and had the 10000 md files built and written in 2 seconds. 2 SECONDS! 

Most CI and framework will encourage you to write node script to build those files... But that will not take 2 seconds, more like 2 minutes. The only preferable solution would be a Go script maybe, but you will need to careful choose your CI in order to set it up properly and, you need a Go programmer on your team. 

The advantage of running Hugo twice, is you're using the same framework, same language, same caching logic for your endpoints, and most importantly, the same binary (to bind them all!) No extra setup, just one more configuration file and one more template file.

## Setting up the config/data

First we need to register our taxonomy. As we'll be using it to add our monster's references, let's add a taxonomy with a not too ambiguous name: `monsters_ref` . This happens in your project's `config.yaml`

```yaml
# config.yaml
baseURL: http://monster-spotting.com/
languageCode: en-us
title: Monsterspotting
taxonomies:
  monster_ref: monsters_refs
```

Then, in our content directory we'll add a content file to hold our monsters.

```yaml
# content/monsters.md
---
title: Monsters
layout: monsters
monsters_refs:
  - althea-rubber
  - rona-wood
  - gus-vinyl
  - amity-granite
  - angele-steel
  # [... more monsters! ...]
  - wat-glass
---
```

Now, out of the box, Hugo will create a page at `/monsters` and our monster's pages at `/monsters_refs/{ref}`

We can customize that permalink by adding a `permalinks` settings:

```yaml
# config.yaml
# [...]
taxonomies:
  monster_id: monsters_ids
permalinks:
  monsters_refs: /monster/:title
```

## Building our monster pages!

Now that Hugo is building one page for each monster we can go and customize those. The trick here is to locate which template file Hugo will use to generate the `monsters_refs` term pages. Reading Hugo Template Lookup documentation, it seems it will be at `/layouts/taxonomy_name/term.html` so in our case:

`layouts/monsters_refs/term.html`

Now from inside that template file's context we don't have a lot info about our monster:

- `.RelPermalink` and `.Permalink` will hold the URL for the page which thanks to our previous configuration will most likely be `/monsters/ronda-wood`, `/monsters/gus-vinyl` etc...
- `.Data.Term` will hold the term as referenced in the `/monsters.md` content page `"rona-wood"`, `"gus-vinyl"` etc...
- `.Title` which will in most case match `.Data.Term`
- `.Pages` will list all the pages this monster has been assigned to. Us hackers won't need this as we only have one!

Except for that permalink, this is not very useful though! We want to print monsterspotting data about our monster!

## Retrieving our monsters data from their page template

We'll assume we have our ready-made data file referencing them at `/data/monsters.json` ([you can download it here](https://github.com/regisphilibert/monsterspotting.com/blob/main/data/monsters.json))

```json
{
  "rona-wood": {
	  "league": "Teal",
	  "name": "Rona Wood",
	  "spotted": "New York City"
		"svg": "<svg viewBox=\"0 0 120 120\" id=\"PixelMon_46\etc..."
	},
  "gus-vinyl": {
	  "league": "Fuscia",
	  "name": "Gus Vinyl",
	  "spotted": "Montreal",
		"svg": "<svg viewBox=\"0 0 120 120\" id=\"PixelMon_46\etc..."
},
[...]
```

Our monsters have a name, a spotting location, a league and a cute little SVG so we don't confuse them!

Now from our monsters' individual page, in order to grab the monster's data as stored in the data file, we simply need to look for a key matching our term's name. As seen above, it's stored in `.Data.Term` and will match the `"ronda-wood"` key in our data file and so on for every other monsters.

We can rely on the [index](https://gohugo.io/functions/index-function/#readout) function to look for the object in our data file stored under the monster's reference key:

```go-html-template
{{ with index site.Data.monsters .Data.Term }}
	Here you are little monster named {{ .name }} and spotted in {{ .spotted }}
{{ end }}
```

Now this is more like a real page template though:

```go-html-template
{{ define "main" }}
  {{ with index site.Data.monsters .Data.Term }}
  <div class="...">
    <h1 class="...">{{ .name }}</h1>
    <div class="...">
      <p>{{ .name }} was spotted in {{ .spotted }}. Look out for his cute mug:</p>
      <div class="avatar">
        {{ .svg | safeHTML }}
      </div>
    </div>
  </div>
  {{ end }}
{{ end }}
```

And that's it!

We're building pages from data with Hugo! 🎉

## Building the list page

Now that we all understand the concept, we can plus the project by creating a list page for our monsters. We defined a custom layout for our `content/monsters.md` page called `monsters` so we'll go to `/layouts/_default/monsters.html` as this is where Hugo expects the template file for custom template.

Now we could grab our data file and list its entries, but this would mean guessing the permalink ourselves and we don't want that. We want their real Hugo generated `.RelPermalink`.

So we are going to have to list the pages for the terms of the `monsters_refs` taxonomy.

For this we'll rely on the Taxonomy API of Hugo. All of your project's taxonomies are stored under `site.Taxonomies`:

```go-html-template
{{ range site.Taxonomies.monsters_ids }}
   Here is my monster's term object!
{{ end }}
```

Now we'd be tempted to use `.RelPermalink` directly on that term object but its root value is not the term's page, it's actually a collection of pages to which it is assigned called `WeightedPages`. But all is good though as the term stores its own page data under a `.Page` method. From there we'll get the familiar context we already used when building individual pages.

```go-html-template
{{ range site.Taxonomies.monsters_ids }}
   <a href="{{ .Page.RelPermalink }}">Here's my little monsters ref: {{ .Page.Data.Term }}</a>
{{ end }}
```

Good! Now using the same trick as before, we'll be able to fetch the data for each listed monster:

```go-html-template
<ul>
{{ range site.Taxonomies.monsters_refs }}
   {{\* we store the .Page object so we can use it inside the following `with` context /%}}
   {{ $monsterPage := .Page }}
   {{ with index site.Data.monsters $monterPage.Data.Term }}
	 <li>
    <a href="{{ $termPage.RelPermalink }}">
      <p>{{ .name }} was spotted in {{ .spotted }}</p>
    </a>
	 </li>
   {{ end }}
{{ end }}
</ul>
```

And that's it! With just one data file and one "monster referencing" content file, we've been able to hack Hugo into building pages from data!

## Wrapping up...

In returning partials!

We should really try and wrap most reusable code in [returning partials](https://www.regisphilibert.com/blog/2019/12/hugo-partial-series-part-2-functions-with-returning-partials/)!

Personally I would create two returning partials.

1. One to fetch the data and potentially transform the monsters data
2. And another one to retrieve the monster's term pages so we don't have to use `.Page` all the time.

### 1. GetMonsterPages

```go-html-template
{{ $monsters := slice }}
{{ with site.Taxonomies.monsters_ids }}
  {{ range . }}
    {{ $monsters = $monsters | append .Page }}
  {{ end }}
{{ end }}

{{ return $monsters }}
```

### 2. GetMonsterData

```go-html-template
{{ $monster := dict }}
{{ with index site.Data.monsters . }}
  {{ $monster = . }}
{{ end }}

{{ return $monster }
```

The other great advantage of partials is that you can cache them so the logic is only computed once per build.

Our list template would therefore look much cleaner:

```go-html-template
{{ define "main" }}
<main>
  <h1>{{ .Title }}</h1>
	{{ range $termPage := partialCached "GetMonsterPages" . }}
		{{ with partialCached "GetMonsterData" .Data.Term .Data.Term }}
			<li>
				<a href="{{ $termPage.RelPermalink }}">
				  <p>{{ .name }} was spotted in {{ .spotted }}</p>
				</a>
			</li>
		{{ end }}
	{{ end }}
</main>
{{ end }}
```

### Conclusion

Bravo! By leveraging Hugo's Taxonomy and Data APIs we've been able to fulfill the first objective of our series: building pages from local data!

In the next part, we'll see how we can achieve the same results but instead of using a local data file, we'll be safely fetching our monster's data from a remote API!

Also, we'll see how we can paginate our file-less monster pages.

#### Notes & Credits

The SVGs and the general monsters idea come from the very fun [PixelEncounter project](https://pixelencounter.com/Api/Monsters) while the monster's funny names and other metadata have been generated using the oh so awesome [Mockaroo](https://www.mockaroo.com/).

The final Monsterspotting project repo is at [github.com/regisphilibert/monsterspotting.com](https://github.com/regisphilibert/monsterspotting.com). Feel free to take a look at the files mentioned in this article.
