---
draft: false
authors:
  - persons/regis-philibert.md
date: 2021-06-24T08:32:27.000Z
twitter_description: |-
  .@GoHugoIO's notorious limitation will be lifted soon! But while building pages from data remains unsupported by our favorite CMS, you can start exploring the concept with a workaround we detail in this two part series.

  #gohugo #JAMStack #ssg #golang #headlesscms
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
---

## Hugo's notorious and soon to be lifted limitation

{{% aside %}}

#### Lifted soon but when?

There is no date set for when Hugo will be able to build pages from data. It will most likely be implemented in two parts much like this series.

First, it will build from local data.
Then, it will build from remote data using a unique fetch mechanism and DX yet to be defined.

You can follow the conversations on Hugo's repo:

- [#5074](https://github.com/gohugoio/hugo/issues/5074)
- [#6310](https://github.com/gohugoio/hugo/issues/6310)
  {{% /aside %}}

At The New Dynamic we love Hugo, the framework we use to build many of our websites. Through the years there has been no objective, no client request, no challenge we were not able to meet with this amazing tool. But there is one limitation which can be tedious to circumvent: Hugo cannot build distinct pages from data sources outside of individual files! No section of a site can be safely populated from an external API such as a headless CMS.

To be fair, when Hugo was created, headless CMSs were barely on the map. And, this limitation will be lifted in time. Meanwhile we've been exploring ways not to compromise on our site building and get around the limitation.

Hugo does handle data and json requests: You can have your `data/monsters.json` array accessible through `site.Data.monsters`, or `https://api.monsters.com/v1/monstersdata` API endpoint available through `getJSON`, but Hugo, in spite of all its amazing feats, will not be able to build a page for each of those monsters.

That is, not on its own. Yes there is a work-around!

Over the course of this two part series, we'll get into details as we conceptually build a Monsterspotting website which will publish one page for each of its "file-less" monsters and a paginated listing page!

In the first part we'll use a local data file to build our pages: **Toward using a Headless CMS with Hugo: Building Pages from Data**

Later, in the second part, we'll cover the remote side of it, using a distant API to build our pages: **Toward using a Headless CMS with Hugo: Building Pages from an API**

## TL;DR: The work-around

First, let's quickly go over the concept here.

Hugo needs a content file in order to acknowledge a page in its content system. But it's not true for every page. Your homepage doesn't need one, neither does your paginated sections or (and this is where it gets interesting) your taxonomy terms.

Whenever you have a taxonomy in your project, like `tags` or `categories`, whose terms are added to pages, Hugo will produce a page for each of those terms.

Let's imagine we have a `monsters` taxonomy in our project with only one post using it:

```yaml
# content/post/two-monsters-montreal.md
---
title: Two identified monsters spotted in Montréal today!
monsters:
  - rona-wood
  - gus-vinyl
---
What a day...
```

Hugo will build a page for the post, obviously, but also for both the `monsters` taxonomy terms. The orignal intention was for Hugo to dynamically build term archive pages where websites would list all the posts assigned a given term.

For our current example, the end result is that we'll end up with a page at `/monsters/rona-wood` and another one at `/monsters/gus-vinyl` !

Note that none of those pages necessitated a content file.

And now that we have a way for Hugo to acknowledge our "file-less" pages, we can tap into the term template which Hugo expects at `/layouts/monsters/term.html`

From that template context, assuming you have a data file with references matching your term's, something like:

```json
{
	"rona-wood": {
		"spotted": "New York City",
		"name": "Althea Rubber"
	},
	"gus-vinyl": {
		"spotted": "Montreal",
		"name": "Gus Vinyl"
	}
}
```

You will be able to grab that particular page's data with a simple:

```go-html-template
{{ with index site.Data.monsters $.Data.Term }}
  {{ .name }} has been spotted in {{ .spotted }}
{{ end }}
```

or as we'll cover in the second part of this series, retrieve its data from an api with

```go-html-template
{{ with getJSON "https://api.monsters.com/v1/monstersdata" $.Data.Term }}
  {{ .name }} has been spotted in {{ .spotted }}
{{ end }}
```

No content files except for the one holding the term list, no Front Matter, just plain Hugo building pages from data.

**That's it for the concept! Let's dive in!**

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
