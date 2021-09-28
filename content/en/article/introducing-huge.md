---
draft: false
authors:
  - persons/regis-philibert.md
featured: /uploads/huge-featured.png
date: 2021-09-28T07:32:27.000Z
title: "HUGE Announcement!"
slug: introducing-huge
---

## Introducing HUGE, a Hugo framework.

We've been cooking something interesting at TND which could benefit Hugo users. It's a framework you can use on any Hugo project.

The concept revolves around making some critical Hugo features declarative.

Even though Hugo handles a lot from configuration, most of its new main features (pipes, js.build, image transformation) do not. HUGE aligns their ease of use with other features of Hugo so users don't have to educate themselves about their API and focus on what matters: HTML, Javascript, CSS.

- Just a few lines of yaml to process __scripts__ supporting React or __styles__ supporting sass, tailwind, purgecss, you name it! 
- Just some configuration maps to generate your hosted fonts's fontface declaration!
- An easy to use `partial` to transform your __media__ files using either Hugo's image processing or imgix!
- HUGE will also automatically generates all the __SEO__ tags your content will need including jsonld.
- It even sports its own __environment__ solution so testing environment is just as easy as the rest of Hugo!

Lastly, as HUGE handles most of your needs from configuration files, it also sports "configuration functions". A way to point to a partial whose returned value will be used for your setting... Think of it as "dynamic config".

HUGE is almost reaching Alpha, and has many more features to come! We're eager to get some feedback from the Hugo community!

## HUGE Scripts!

HUGE will process your scripts with Hugo's powerfull [`js.Build`](https://gohugo.io/hugo-pipes/js#readout).

```yaml
# _huge/config/scripts.yaml
scripts:
- name: hugely
  path: js/hugely/index.jsx
```

```go-html-template
<head>
  {{ partial "huge/scripts/tags" "hugely" }}
</head>
```

{{< huge_wiki "Scripts" >}}

## HUGE Styles!

HUGE will process your styles with Hugo's powerfull [Pipes](https://gohugo.io/hugo-pipes/) (sass, postcss, purgecss, tailwind you name it...)

```yaml
#_huge/config/styles.yaml
styles:
- name: main
  path: css/main.scss
  use:
  - tailwind
```

```go-html-template
<head>
  {{ partial "huge/styles/tags" "main" }}
</head>
```

{{< huge_wiki "Styles" >}}

## HUGE Media! 

HUGE and its `huge/media/Get` function can transform images with Hugo's powerful [image transformations](https://gohugo.io/content-management/image-processing/) or... imgix!

```go-html-template
{{ $args := dict
  "path" "/media/aldric-rivat-LfsDV6VObmw-unsplash.jpg"
  "width" 500
  "rotate" 45
}}
{{ with partial "huge/media/Get" $args }}
  <img src="{{ .RelPermalink }}" alt="Rotated victorian houses">
{{ end }}
```

```html
<img src="/media/aldric-rivat-LfsDV6VObmw-unsplash_hu64391a0_2570469_500x0_resize_q75_r45_box.jpg" alt="Rotated victorian houses">
```

{{< huge_wiki "Media" >}}

## HUGE SEO! 

Huge will build all the meta tags you need in your head, even jsonld with zero configuration! 

```yaml
---
# content/blog/victorian-houses.md
title: Victorian Houses
date: 2021-06-24T08:32:27.000Z
image: /media/aldric-rivat-LfsDV6VObmw-unsplash.jpg
translationKey: victorian-houses
seo:
  description: Victorian House galore for everyone who loves them!
---
Photo Credits: [Aldric Rivat](https://unsplash.com/@aldric)
```

```go-html-template
<head>
<!-- SEO -->
{{ partial "huge/seo/tags" . }}
</head>
```

```html
<head>
<!-- SEO -->
<title >Victorian Houses | Architecture Then!</title>
<meta content="index, follow" name="robots">
<meta content="Victorian Houses | Architecture Then!" property="og:title">
<meta content="Victorian Houses | Architecture Then!" name="twitter:title">
<meta content="Today we write about: Victorian House galore for everyone who loves them!" name="description">
<meta content="Today we write about: Victorian House galore for everyone who loves them!" property="og:description">
<meta content="Today we write about: Victorian House galore for everyone who loves them!" name="twitter:description">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"website","dateModified":null,"datePublished":null,"description":"Today we write about: Victorian House galore for everyone who loves them!","headline":"Victorian Houses | Architecture Then!","image":"media/aldric-rivat-LfsDV6VObmw-unsplash_1200x0_resize_q75_box.jpg","url":"https://archi-then.com/post/victorian-houses/","wordcount":"8"}</script>
<meta content="https://archi-then.com/post/victorian-houses/" property="og:url">
<meta content="https://archi-then.com/post/victorian-houses/" name="twitter:url">
<meta content="Architecture Then!" property="og:site_name">
<meta content="en" property="og:locale">
<meta content="https://archi-then.com/post/victorian-houses/" name="canonical">
<link href="https://archi-then.com/fr/post/maisons-victoriennes/" hreflang="fr" rel="alternate">
<meta content="website" property="og:type">
<meta content="2021-06-24T08:32:27+00:00" property="og:published_time">
<meta content="/media/aldric-rivat-LfsDV6VObmw-unsplash_1200x0_resize_q75_box.jpg" property="og:image">
<meta content="/media/aldric-rivat-LfsDV6VObmw-unsplash_1200x0_resize_q75_box.jpg" name="twitter:image">
<meta content="summary_large_image" name="twitter:card">
</head>
```

{{< huge_wiki "SEO" >}}

## HUGE Fonts!

```yaml
# _huge/config/fonts.yaml
fonts:
- family: Open
  file: fonts/open-sans-v17-latin-300
  weight: 300
  style: normal
- family: Open
  file: fonts/open-sans-v17-latin-300italic
  weight: 300
  style: italic
- family: Open
  file: fonts/open-sans-v17-latin-regular
  weight: 400
```

```go-template-html
<head>
<!-- fonts -->
{{ partial "huge/fonts/tags "any" }}
</head>
```

{{< huge_wiki "Fonts" >}}

## HUGE Environment!

HUGE offers an environment solution which gives users several functions to test environments following their own logic.

```go-html-template
{{ $env := partial "huge/env/Get" . }}
{{ if eq $env "development" }}
  {{ $debug = true }}
{{ end }}
```

```go-html-template
{{ if partial "huge/env/Is" "production" }}
  {{ $ga = true}}
{{ end }}
```

{{< huge_wiki "Env" >}}

## Get started!

I guess the easiest way to get aquainted with HUGE might be by downloading one of its starters:

### Basic

NPM free, SCSS and vanilla JS : https://github.com/theNewDynamic/huge-starter

### Tailwind + React

PostCSS, Tailwind and React: https://github.com/theNewDynamic/huge-starter-tailwind-react