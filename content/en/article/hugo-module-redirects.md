---
title: Redirects Hugo Module
authors:
  - persons/regis-philibert.md
featured: /uploads/hugo-module-redirects.png
date: 2021-03-09T7:32:27.000Z
twitter_description: |- 
  Redirections and URL rewrites are an essential part of any web project.In this article we'll focus on @netlify's own redirection methods; how we dynamically set our rules in its format; how we packaged our approach in a reusable open source solution; and how to use the resulting @GoHugoIO Module on your Netlify hosted website.
  
  #ssg #netlify #hugo #modules

slug: hugo-module-netlify-redirects
tags:
  - hugo
  - modules
  - JAMStack
  - imgix
subjects:
  - dev
description: This article is about the hows-and-whys of the TND Redirects Hugo Module.
seo:
  description: Redirections and URL rewrites are an essential part of any web project, and even more-so for sites that serve audiences from different countries. To deliver the right HTML file to the right audience, we need a robust and finely tuned set of redirection rules. In this article we’ll focus on Netlify’s own redirection methods; how we dynamically set our rules in its format; how we packaged our approach in a reusable open source solution; and how to use the resulting Hugo Module on your Netlify hosted website.
---

Redirections and URL rewrites are an essential part of any web project, and even more-so for sites that serve audiences from different countries. 

At theNewDynamic we provide localized content to make sure visitors from France, for example, can access any pages of our client's website with a language and format adapted to the French market.

To deliver the right HTML file to the right audience, we need a robust and finely tuned set of redirection rules.

In a Jamstack context, while most of your URLs naturally match your page's `index.html` file path, any other special routing parameters must be communicated to your CDN host.

This communication can take many forms, depending on the CDN service, but one requirement remains: you need to dynamically set those rules so content addition does not require a developer's attention.

In this article we'll focus on Netlify's own redirection methods; how we dynamically set our rules in its format; how we packaged our approach in a reusable open source solution; and how to use the resulting Hugo Module on your Netlify hosted website.

This article is about the hows-and-whys of the TND Redirects Hugo Module.

## Redirections on Netlify

### What constitutes a redirection/rewrite rule.

These are the critical things to take into account when setting a rule with Netlify.

- **from**: What is the URL the user followed?
- **to**: Where should we take the user?
- **code**: The HTTP status code, 3XX is a redirect, 2XX is a rewrite, many others in between.
- **country**: If the rule is targeting an audience by country, we need to know its [code](https://dev.maxmind.com/geoip/legacy/codes/iso3166/).
- **language**: If the rule is targeting an audience by language, we need to know its [code](https://www.metamodpro.com/browser-language-codes).
- **role**: If the CDN supports user roles (Netlify does), they can constitute an audience.
- **force**: By default, a redirection or rewrite only happens if the origin URL does not exist. In order to apply the rule, even if the origin page exists, you need to force it.

### How to communicate the rules to Netlify.

- **Through your `netlify.toml` [configuration file](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file).** 
This is okay for small global rules, but impossible to dynamically populate as this needs to be committed to your repo.
- **Through a `_redirects` [file](https://docs.netlify.com/routing/redirects/?utm_campaign=devex&utm_medium=proxy-shadows-pnh&utm_source=blog#syntax-for-the-redirects-file) published at the root of your website.**
Now this is interesting because we can have our framework dynamically build and publish that file with the many rules we need.

## We need:

1. **To abstract ourselves from Netlify's ways so our solution can be expanded to other services in the future.**
Netlify is great, but some clients might need a different CDN, and we don't want to have to maintain X different redirection solutions and  X different configuration terms. Our project and its redirects should migrate to a new service with minimal intervention.
This means an unopiniated UX and terminology and a good way to pick the right rule formatting logic depending on the service.
2. **The ability to hard-set rules through the Hugo project's `config.yaml`.**
Simple and global rules should be set the easy way, through a configuration file. 
We could rely on  `netlify.toml` for redirections. But we just mentioned the importance of owning your own terminology! Also we always want to limit the number of configuration files. And finally we really don't want to miss out on [Hugo's Configuration Directory](https://gohugo.io/getting-started/configuration/#configuration-directory).
3. **The ability to complement those hard-set rules with code.** 
Fore more complex and dynamic rules, we'll need code. In Hugo terms this translates into a [returning partial](https://regisphilibert.com/blog/2019/12/hugo-partial-series-part-2-functions-with-returning-partials/) which would send more rules to our Module depending on some computed factors.
4. **For Hugo projects, to use [Hugo's Aliases](https://gohugo.io/content-management/urls/#yaml-front-matter) UX while transferring responsibility to Netlify.**
Hugo's own way to deal with redirections is good, but superfluous now that the CDN handles them. We can still look for the Front Matter `aliases` found on pages and complement our redirect rules with those.

### 1. Service abstraction

We love Netlify and use it for most of our projects, but our goal is that the Module be the sole entry for adding rules regardless of potential CDN services. 

We took our experience gained from building another service abstracting module: [TND Forms Hugo Module](https://github.com/theNewDynamic/hugo-component-tnd-forms). It supports both Netlify Forms and Formspree solutions but the users do not have to concern themselves with those. The UX and terminology is consistent regardless of the service. This what we call service abstraction!

#### UX and terminology

Let's see how our Module conceptualize a rule using our terminology. We'll use `origin` and `target` instead of Netlify's `from` and `to`

```yaml
origin: /faq
target: /faq-canada
country: ca
force: true
```

This redirects users navigating to `/faq` to a page dedicated to their audience, `/faq-canada` . It is a forced redirection because here the `/faq` page does exist, we just want Canadians to see a  different one.

We  won't go into the details of Netlify redirect rule format, but this how this rule should look like in the `_redirects` file:

```
/faq /faq-canada 301! Country=ca
```

Note that `origin` and `target` can take any [format understood by Netlify](https://docs.netlify.com/routing/redirects/redirect-options/#query-parameters) or any future potential service.

```yaml
origin: /posts brand=:id tag=:tag 
target: /posts/:tag/:brand
code: 201
```

Here `/articles?id=12&tag=arts` will point to `/post/arts/12` without changing the browser address.

Again as a Netlify rule:

```
/articles id=:id tag=:tag /posts/:tag/:id 201
```

#### Adaptable code

The Module uses a function called `netlify/FormatRule` to turn any given rule map into a Netlify's readable line.

When a new service is supported we'll simply add `that-service/FormatRule` and the Module will pick it up.

Of course, other changes might occur, but they won't require any code intervention from the Module's users.

### 2. Hard-set rules.

Now that we've agreed on a terminology, we'll use our Hugo projects's reserved `params` key to ensure there are no conflicts and allow users to add rules themselves.

```yaml
# config.yaml
params:
  tnd_redirects:
    rules:
    - origin: /faq
      target: /faq-canada
      country: ca
      force: true
    - origin: /posts brand=:id tag=:tag
      target: /posts/:tag/:brand
      code: 201
```

Now the Module can just look at `site.Params.tnd_redirects.rules` and generate the corresponding rules.

### 3. Complement rules with code

Now hard-set is fine, but again, not enough. We need more control.

Adding a new rule through the configuration file seems pretty easy for a developer, but it may not be for an editor. For them, we want to build our own CMS logic, and build our rules from that.

It's also pretty handy for regionalization.

#### How do we do that?

Well the Module sports a returning partial or function called  `AddRules`, which returns an empty array. 

Regardless of the content of the array returned, the Module will try to add the rules contained in the array on top of the rules defined in the configuration file.

Thanks to Hugo's union filesystem any user adding a homonymous partial on their project at `layouts/partials/tnd-redirects/AddRules.html` will overwrite the Module's own partial. 

It is now up to the user to have their own partial return an array of complementary rules to be consumed, and processed by the Module.

#### Practical example

Let's say the project needs to serve users from Canada a dedicated product page, different than the one served to other countries (shipping costs, tax information etc...). But only if the editor checked the "localize" box.

For every concerned product we want the Module to add the following conceptualized rule.

```yaml
origin: /product/big-fat-bag/
target: /product/big-fat-bag/canada.html
code: 201
force: true
country: ca
```

In order to do so, the user should just have to add the following Go Template code to their project's `AddRules` partial:

```go
{{*/ layouts/partials/tnd-redirects/AddRules.html */}}
{{ $rules := slice }}
{{ range where site.RegularPages "Type" "product" }}
  {{ if .Params.localize }}
    {{ $origin := .RelPermalink }}
    {{ $target := print $origin "canada.html" }}
    {{ $rule := dict "origin" $origin "target" $target "code" 201 "force" true "country" "ca" }}
    {{ $rules = $rules | append $rule }}
  {{ end }}
{{ end }}

{{ return $rules }}
```

Good! Users can now code the additions of rules unique to their project's context!

### 4. Hugo's Aliases. Netlify redirects.

See it as a built-in `AddRules` logic. We simply list all available pages from every sites (languages), retrieve their `Aliases` as set per Hugo's own Front Matter UX, and add the matching rule.

Of course this will happen only if the user requested it, as Hugo's own alias solution is perfectly satisfactory for many.

## Using the Module

At last!

### Install

We've covered a lot of Module articles here on this blog, returning readers should be familiar with the following:

Make sure your project is `init` as a Hugo Module and:

```yaml
# config.yaml
module:
	imports:
   - path: github.com/theNewDynamic/hugo-module-tnd-redirects
```

### Publish `_redirects`

Add to your homepage the output format corresponding to Netlify redirects. This can be done either through your configuration file:

```yaml
# config.yaml
outputs:
  home:
  - HTML
  - tnd_redirects_netlify
```

Or through your homepage's content file:

```yaml
# content/_index.md
---
title: Homepage
outputs:
- HTML
- tnd_redirects_netlify
---
```

Notice: This will overwrite any default output formats settings. Make sure to double check [Hugo's defaults](https://gohugo.io/templates/output-formats#default-output-formats) so you don't accidentally remove a needed format.

### Set rules through configuration file

See [2. Hard-set rules](#2-hard-set-rules)

### Set rules through code

See [3. Complement rules with code](#3-complement-rules-with-code)

### Aliases

In order to use Netlify to add the redirection set through Hugo's aliases you should:

- Set `disableAliases` to true in you Hugo's project's configuration.
- Set `use_aliases` to true in the Module's configuration map in your project.

```yaml
# config.yaml

DisableAliases: true
params:
  tnd_redirects:
    use_aliases: true
```

That's it that's all!

## All your redirects needs, packaged!

By understanding a problematic we constantly have to address on most of our Netlify hosted projects, we were able to package its answer in a Hugo Module available for us and for all. 

From now on, we'll never have to drop a hard-coded `_redirects` file in a `/static` directory or configure redirects through the `netlify.toml` file.

And yet, this does not limit our abilities or control over the great powers Netlify redirects and rewrites offer to our clients. Nor does it limit us to any services! By thinking up our own API, we made the Module service abstracted and ready to integrate other hosting provider redirects approach! Once any of those matches Netlify's of course...