---
authors:
  - persons/regis-philibert.md
featured: /uploads/hugo-data.png
date: 2022-01-31T9:32:27.000Z
title: "Hugo and Data: Advanced Transformations (ignore)"
slug: hugo-data-manipulation-and-logic-advanced-transformations
draft: true
tags:
  - hugo
  - modules
  - JAMStack
  - logic
subjects:
  - dev
description: Hugo is well know for minimal config templating features. But do you know it's also great at structuring and manipulation data?
---

## To reality and beyond!

Ok, that is all well and good, but let's be honest, hardcoding your data this way can be useful for defining defaults or re-usable bases but not much more. 
Usually your data comes from a source you lack control of like an API, or a Data file or most usually a user managed content file. In this second article about Hugo and Data, we'll cover how you can take data from a limited source (basic Front Matters, API endpoints) and transform it to better suit your project's needs. We'll use a lot of stuff covered above, but also more advanced ones so we code cautiously with always, readablity, scalablity and build time concern!

Let's assume one of our gent as a markdown file would look something like this:

```yaml
---
# content/gent/john-lennon.md
title: John Lennon
date: 1940-10-09 #let's use something more precise
bands:
- Beatles
city: Liverpool
instruments:
  - Piano
  - Guitar
  - Vocals
---

John Lennon was an English singer, songwriter, musician and peace activist who achieved worldwide fame as the founder...
```

Up there is our source, our input, now here's what we need to be able to use on the template front:

```text
"firstname" String
"lastname" String
"fullname" String
"birthdate" Date
"instruments" Map
  "number" int
  "string_rep" String
  "list" Slice
"city" String
"bands" Slice
```

Let's turn our gents into new ones:

```go-html-template
{{ $new_gents := slice }}
{{ range site.RegularPages ".Type" "gent" }}
  {{ $new_gents = $new_gents | append (dict
    "fullname" .Title
    "firstname" (index 0 (split .Title " "))
    "lastname" (index 1 (split .Title " "))
    "birthdate" .Date
    "instruments" (dict
      "string_rep" (delimit .instruments ", " "and")
      "number" (len .instruments)
      "list" .instruments
    )
  )
  }}
{{ end }}
```

First thing of note is we only have a fullname as the file's `.Title`. We add it as `fullname` because it makes much more sense.

If you've followed the first part well you should be able to see what's happening next. We're using `split` a function which does the opposite of `delimit`. It takes a string as first parameter and creates a slice with all the substrings delimited by the second parameter.
Of course, the firstname will be the first entry at 0 and lastname the second one at 1. We use `index` to retrieve those.

We also pass the entry's `.Date` as `birthdate`. I wouldn't recommend it outside of this educational context.
We've also created a `instruments` maps with various informations that we could use. 

For example if our projects needs to sort out gents by the number of instruments they play, it would be as easy as:

```go-html-template
{{ $gents := sort $new_gents "instruments.number" }}
```

## Transform with a partial

That's really good, but we should really isolate our transforming operations in a returning partial so the above is cleaner like that:

```go-html-template
{{ $new_gents := slice }}
{{ range $gents }}
  {{ $new_gents = $new_gents | append ("partial" "transform_gent" .)
{{ end }}
```

And from that partial we'd return a simple map of our new transformed gent.

```go-html-template
{{/* /layouts/partials/transform_gent.html */}}
{{ return dict
    "fullname" .Title
    "firstname" (index 0 (split .Title " "))
    "lastname" (index 1 (split .Title " "))
  [etc...]
}}
```

I think it's up to debate if this function can be called a `transformer`, so use with caution, but that's what we'll call it in this safe place which is that article.

## Inside our transformer

Nice. Now let's focus on the content of `transform_gent.html`, it's a bit naive as it is. We're assuming all those keys have been filled. 
But what if there is no instruments? Then we should probably do not use delimit, and simply return an empty slice!
What if there is no "lastname"? Then our `index` will defintely fail and break our build!

We cannot simply declare our `dict` in one shot anymore. We have to increment the additions of key/value pairs based on certain conditions. 

Great! We know how to do it! 

Well... I know we've covered `merge` to achieve this. But there is one serious problem with the `merge` technique, it's pretty slow. If you only have a few hundred gents, it should be okay, but if you need to transform thousands of gents, you'll end up bumping your build time considerably. The reasonable approach is `Scratch`. Scratch is seldom used these days but it remains the best solution to modify maps!

{{% notice %}}
We'll limit ourselves to the [`.SetInMap` scratch method](https://www.regisphilibert.com/blog/2017/04/hugo-scratch-explained-variable/#scratchsetinmap). It takes three parameters, the map to modify, the concerned key and the value. If the key exists, it overwrites its value, if it does not exist, it creates it with given value.
{{% /notice %}}

Let's start from .Scratch!

```go-html-template
{{/* /layouts/partials/transform_gent.html */}}
{{ $s := newScratch }}
{{ $s.Set "gent" dict }}

{{ return $s.Get "gent" }}

```

First store our scratch instance in a `$s` variable (short for... Scratch!). All its methods and data will be stored in there.
Then we store an empty map in our scratch called `"gent"`
Right after that we'll proceed to our various conditions and data manipulations.
At the end, we return the `"gent"` map stored in the `$s` Scratch.

Ok let's start safely transforming our gents!

Let's improve that firstname/lastname thing. Currently it will only work with the most basic name like John Lennon but what if a zealous editor entered `title: John Winston Lennon`.  Now our little concoction would use the wrong part as `lastname`. Another problem if the editor enters `title: Ringo`. This time we have a broken build on our end. 

First we need to make sure we have at least 2 strings seperated by a whitespace.

```go-html-template
{{ with split .Title " " }}
  {{ if gt (len .) 1 }}
  tada emoji
  {{ end }}
{{ end }}
```

Having more than one does not mean we have two, there could be 3 or 5 words in there. Let's use `first` and `last` on the resulting slice! This way we'll be sure to only get the first and last strings. Because we're always using `with`, it's safe to use `index` because we know we have a slice with a least one item.

```go-html-template
{{ with split .Title " " }}
  {{ if gt (len .) 1 }}
    {{ with first 1 . }}
      {{ $s.SetInMap "gent" "firstname" (index . 0) }}
    {{ end }}
    {{ with last 1 . }}
      {{ $s.SetInMap "gent" "lastname" (index . 0) }}
    {{ end }}
  {{ end }}
{{ end }}
```

Finally we'll decide what to do if we only have one word in there. I guess it could be the firstname...

```go-html-template
{{ with split .Title " " }}
  {{ if gt (len .) 1 }}
  [...]
  {{ else }}
    {{ $s.SetInMap "gent" "firstname" (index . 0) }}
  {{ end }}
{{ end }}
```


We then proceed to test for the `.birthdate` key. `with` will work if that key is filled by anything. It will fail if it holds a falsy value like `false` or an emtpy string or emtpy slice or an emtpy map.
On success we execute we move down our `with` and use Scratch's `SetInMap` method to append a new key/value pair to our scratching gent. The key is `birthday` and the value is our `time .` already used before.

We'll forget those 3 lines in the forcoming code blocks. 
First conditional addition could be the instruments:

```go-html-template
{{ with .instruments }}
  {{ $instruments := dict
    "string_rep" (delimit . ", " "and")
    "number" (len .)
    "list" .
  }}
  {{ $s.SetInMap "gent" "instruments" $instruments }}
{{ end }}
```

We did not talk about `with` yet. If you're completely unaware of it, it's a nice way to test a value. `with` is not a function, it is a statement, like `if` or `range`. As such, the code inside a `with` will only be executed if the `with` passes. The `with` passes, if the tested value is not falsy. 
For an slice or a map, it should __not__ be empty. For an integer, it should __not__ be `0`. For a string it should not be `""`, etc...




