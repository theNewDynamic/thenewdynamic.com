---
authors:
  - persons/regis-philibert.md
featured: /uploads/hugo-module-imgix.png
date: 2021-12-21T9:32:27.000Z
title: "Hugo and Data"
slug: hugo-data-manipulation
tags:
  - hugo
  - modules
  - JAMStack
subjects:
  - dev
description: Hugo is well know for minimal config templating features. But do you know it's also great at structuring and manipulation data?
---
We'll use four famous gentlemen.

## Prerequisite
Being familiar with Go Template syntax, but certainly not advanced. Let's say if you've already ranged on `.Pages` and print stuff on a page, you'll ge good!

## Slices

Slices are flat arrays, they can be made of strings, maps, Pages etc... What matters is that each entry be of the same type.

### Creating a slice
We create a slice using the `slice` function:

```go-html-template
{{ $gents := slice "John" "Paul" }}
{{ range $gents }}
I love {{ . }}
{{ end }}
```

☝️ This will print:
I love John
I love Paul

### Adding to a slice, or append.
We use the `append` function. It takes two parameters. First parameter, is what we add to the slice, second parameter is the slice in question.

```go-html-template
{{ $gents = append "Ringo" $gents }}
```
In plain english: __*Append Ringo to the Gents*__

Note that if your first argument is a another slice, it'll add all its entries!

```go-html-template
{{ $gents = append (slice "Ringo" "George") $gents }}
```
"Append Ringo and George to the Gents"

Now we'll have:
I love John
I love Paul
I love Ringo
I love Ringo
I love George

Oops, Ringo's been added twice, once as a lone `string` argument and once as part of that [Ringo George] `slice`, no sweat we can use `uniq` to ensure there's no duplicate:

```go-html-template
{{ $gents = uniq $gents }}
```

### Prepend?

Sure, there's no `prepend` function, but `prepend` will do. Instead of adding Ringo (1st argument) to the slice [John Paul] (2nd argument) we want to add the slice [John Paul] to the slice [Ringo]... We just revert the argument order and make sure Ringo a slice:

```go-html-template
{{ $gents = append $gents (slice "Ringo") }}
```
Or in plain english: __*Append the Gents to Ringo*__

{{% notice %}}
Go Template has that pipe thing that allows to chain functions. The offsetting thing is that the left part will be passed as the last argument of the chained function. And when you append to a slice, the order matter.

```go-html-template
{{ $gents = $gents | append "Ringo" }}
```
Actually means: __*Append "Ringo" to the Gents*__ or __*The Gents are taking Ringo in...*__ 🤷
{{% /notice %}}

### Index

If you want to retrieve the index from a range on a slice, you can actually store it alongside the value at cursor like this:

```go-html-template
{{ range $index, $gent := $gents }}
  {{ $gent }} is at index {{ $index }}
{{ end }}
```
Will print:
```text
John is at index 0
Paul is at index 1
Ringo is at index 2
George is at index 3
```

Yep, pretty much like in any programming language, the index starts at 0. 
{{% notice %}}
Even though our value is now stored in a `$value` variable, it remains available in the `.`.
```go-html-template
{{ range $index, $value := $gents }}
{{ . }} is at index {{ $index }}
{{ end }}
```
{{% /notice %}}

### First, Last 

What if we only want our first 2 gents? Or the last 3? We can use `first` or `last`, both function takes two parameters, an integer and a slice.

```go-html-template
{{ $first_two := first 2 $gents }}
{{ $last_three := last 3 $gents }}
```
This reads nicely don't you think? Now both functions always return a slice, even if it contains a lone gent like `{{ $first := first 1 $gent }}`

### The other `index`.

First and last is good, but what if we want just the 3rd one. Well we could do:

```go-html-template
{{ $third := first 3 $gents | last 1 }}
```

Nah... We can use `index`. This function takes two parameters, a slice (or a map, more on that later) and an integer for the index. So to find the third gent:

```go-html-template
{{ $third := index $gents 2 }}
```

Two because, the index starts at zero! 
{{% notice %}}
We'll often find ourselves using `index . 0` to single out an element wrapped in a slice.
{{% /notice %}}
## Maps

Maps are associative array, meaning you've got keys and values.

To create a map we use the `dict` function. It takes a unlimited set of even parameters.

```go-html-template
{{ $gent := dict "firstame" "John" "lastname "Lennon" }}
```
Since [Hugo 0.81.0](https://github.com/gohugoio/hugo/releases/tag/v0.81.0) we can break lines within statements. This enables more more readable declarations.
```go-html-template
{{ $gent := dict 
  "firstame" "John"
  "lastname" "Lennon"
}}

Firsname: {{ $gent.firstname }}
Lastname: {{ $gent.lastname }}
```
Beautiful!

The above will print:
```text
Firstname: John
Lastname: Ringo
```

### Add to a map

The simplest way is using the merge function. 

{{% aside %}}
The simplest but not the fastest! For very big projects, you shoud rely on `sratch` for Map manipulation to save on build time. We cover this later in this article.
{{% /aside %}}
The merge function takes two arguments, two maps which will be merged into one together. By creating a new map with new pair of key values and merging on top of the existing one, we add to a map:

```go-html-template
{{ $gent = merge $gent (dict "birth" "1940" ) }}
```
### Browsing the map

We range on the map the same way we do a slice. Index is also available, although this time it holds our key.

```go-html-template
{{ range $key, $value := $gent }}
  {{ $key }}: {{ $value }}
{{ end }}
```
Will print:
```text
birth: 1940
firstame: John
lastname: Lennon
```

You'll notice that the order does not follow the one we used. That's because Hugo (Go) systematically re-order pairs by their keys. Slice on the other hand will always keep their defined order.

Ok! Now that gent played many instruments, we'll only add the few he played with the group, and we'll break lines to make it a bit more elegant.

```go-html-template
{{ $gent = merge $gent (dict
  "instruments" slice
    "Piano"
    "Guitar"
    "Vocals"
) }}
```

Now our `range` will print:

```text
birth: 1940
firstame: John
instruments: [Piano Guitar Vocals]
lastname: Lennon
```

Instruments does not look too good though! We should test if our value is a slice, and behave appropriately. We'll use `delimit` to join the slice's value into a string with a comma as delimiter. 

Hugo cannot test for any type, but it does for those two we just covered. 
`reflect.IsSlice` and `reflect.IsMap`.

Here we go:
```go-html-template
{{ range $key, $value := $gent }}
  <div>
    {{ $key }}:
      {{ if reflect.IsSlice $value }}
        {{ delimit $value ", " }}
      {{ else }}
        {{ $value }}
      {{ end }}
  </div>
{{ end }}
```
Will print:

```text
birth: 1940
firstame: John
instruments: Piano, Guitar, Vocals
lastname: Lennon
```

### The other `index`.

We covered `index` as a function for slices, but it also works on maps. Only this time the second parameter is a string holding a key from the map.

```
{{ $firstname := index $gent "firstname" }}
```

This function will prove very valuable on maps, when the key in question is stored in a variable:

```go-html-template
{{ $basis := "lastname" }}
{{ if eq $relation "friend" }}
  {{ $basis = "firstname" }}
{{ end }}
Good day {{ index $gent $basis }}!
```

Or a range:

```go-html-template
{{ range slice "firstname" "lastname" }}
{{ . }}: {{ index $gent . }}
{{ end }}
```

## Slices of Maps
Now let's mix slices and maps yeah!

We'll create a slice of maps. We already have one gent so we "instantiate" our slice with him:

```go-html-template
{{ $gents := slice $gent }}
```

Now we can add a new gent in a readable way with linebreaks and pipes:

```go-html-template
{{ $gents = $gents | append (dict
  "firstame" "Paul"
  "lastname" "McCartney"
  "birth" "1942"
  "instruments" (slice
    "Bass Guitar"
    "Guitar"
    "Vocals"
    )
) }}
```

And in order to add our the last two, we can append a slice of the two:

```go-html-template
{{ $gents = $gents | append (slice
  (dict
    "firstname" "Ringo"
    "lastname" "Starr"
    "birth" "1940"
    "instruments" (slice
      "Drums"
      "Vocals"
    )
  )
  (dict
    "firstname" "George"
    "lastname" "Harrison"
    "birth" "1943"
    "instruments" (slice
      "Guitar"
      "Sitar"
      "Vocals"
    )
  )
) }}
```

And now to browse our gents: 

```go-html-template
{{ range $gents }}
  <p>
    {{ .firstname }} {{ .lastname }} was born on {{ .birth }}, he played {{ delimit .instruments ", " " and " }}
  </p>
{{ end }}
```
Will print: 

```text
John Lennon was born on 1940-10-09, he played Piano and Guitar.

Paul McCartney was born on 1942-06-18, he played Bass Guitar and Guitar.

Ringo Starr was born on 1940-07-07, he played Drums.

George Harrison was born on 1943-02-25, he played Guitar and Sitar.
```

## Browsing
Let's try and retrieve informations from our band.

People are using `where` clause all the time to filter out pages and if you're not familiar you should give it glance in the [doc](https://gohugo.io/functions/where/#readout), but you can use it on any kind of collections, slices as well.

__Let's find all gents born in 1940.__

As you know, `where` returns a slice empty or not, so it's safe to use range/else on it.

```go-html-template
{{ range where $gents "birth" "1940" }}
    <p>{{ .firstname }}, {{ .birth }}</p>
{{ else }}
  No gents shrug!
{{ end }}
```

__Now all the gents not born in 1940__

```go-html-template
{{ $gents := where $gents "birth" "!=" "1940" }}
```

__Or born in or after 1942__
```go-html-template
{{ $gents := where $gents "birth" ">=" "1942" }}
```
As you'll have notived by now `where` takes a set of parameters.

The first, `$gents` is the collection. 
The second is the key we're evaluating in the collection's entries `"birth"`.
The third is the operator in use.
The fourth is the value we're trying to match.

If you ommit number two, the operator defaults to `"=="`

I woudn't go as far as writing a javascript comparison but... Ok just one! 

```javascript
gents = gents.map(gent => gent.birth >= 1942)
```

{{% notice %}}
Type must be the same in Hugo, here we're using strings for the yearsHad we been using integers for our gents' birth we should have used `1942` (int) as comparison.
{{% /notice %}}

__Back to playing! Born in 1942 OR 1940?__

```go-html-template
{{ $gents := where $gents "birth" "in" (slice "1940" "1942") }}
```

Here we can use `"in"` to find gents whose birth year is in included in ["1940", "1942"]



__Now want all gents playing the Guitar!__

It's different that with `"in"` as we want to find gents whose instruments' list includes "Guitar".

We'll use the `"intersect"` operator. It compares a slice from the entries with a given slice, and only returns the entries where both slices "intersect".

[Guitar, Piano] and [Bass, Guitar] intersects! They __Guitar__ in common!
[Guitar, Piano] and [Drums, Vocals] do not intersect! Nothing in common!
[Guitar, Vocals] and [Drums, Vocals] do intersect, but with __Vocals__, not Guitar.

Now we only need one intersection, Guitar, so:
```go-html-template
{{ $gents := where $gents "instruments" "intersect" (slice "Guitar") }}
```
And if we wanted to find the gents who played Guitar and Vocals --- __two__ intersections --- we'd:

```go-html-template
{{ $gents := where $gents "instruments" "intersect" (slice "Guitar" "Vocals") }}
```

### Sorting

Some of you might be familiar with the way [pages are sorted with Hugo](https://gohugo.io/templates/lists/#order-content) but this is only for pages, not any kind of colletions, like our gents.

For those there is a `sort` function.

Let's sort our gents by age using their `birth` year:

```go-html-template
{{ $gents := sort $gents "birth" }}
```

`sort` takes a first parameter, the key we'll sort the collection by, and an optional second for the direction. It defaults to ascending.

To reverse the order and have them younger to older, we add a third parameter, `desc` for --- you guessed it --- descending.
```go-html-template
{{ $gents := sort $gents "birth" "desc" }}
```

## Moving to reality!

Ok, that is all well and good, but let's be honest, hardcoding your data this way can be useful for defining defaults or re-usable bases but not much more. 
Usually you data comes from a source you lack control of like an API, or a Data file or most usually a content file.

What we'll focus on now is how you can take data from this source and transform it to better suit your templates' needs.

Let's assume one of our gent as a markdown file would look something like this:

```yaml
title: gent-1
firstname: John
lastname: Lennon
birthdate: 1940-10-09 #let's use something more precise
instruments:
  - Piano
  - Guitar
  - Vocals
---

John Lennon was an English singer, songwriter, musician and peace activist who achieved worldwide fame as the founder...
```

Now this is ideally what we want to make available at an API endpoint or a template:

```text
"firstname" String
"lastname" String
"fullname" String
"birth" Date
"instruments" Map
  "number" int
  "string_rep" String
  "list" Slice
"city" "Liverpool"
```

Let's turn our gents into new ones:

```go-html-template
{{ $new_gents := slice }}
{{ range $gents }}
  {{ $new_gents = $new_gents | append (dict
    "lastname" .lastname
    "firstname" .lastname
    "fullname" (print .firstname " " .lastname)
    "birthday" (time .birthdate)
    "instruments" (dict
      "string_rep" (delimit .instruments ", " "and")
      "number" (len .instruments)
      "list" .instruments
    )
  )
  }}
{{ end }}
```

So first we pass the the straight forward keys, and add a new one called `fullname` to concatenate first and last names.
We also have a `birthday` key which is now a Hugo Date, so you can do `.birthday.Year` or format it any you please.
We've also created a `instruments` maps with various informations that we could use. 

For example to sort our gents by the number of instruments they play we could now do:

```go-html-template
{{ $gents := sort $new_gents "instruments.number" }}
```

## Transform with a partial

That's really good, but we should really isolate our transformer in a returning partials so the above is cleaner like that:

```go-html-template
{{ $new_gents := slice }}
{{ range $gents }}
  {{ $new_gents = $new_gents | append ("partial" "transform_gent" .)
{{ end }}
```

And from that partial we'd return a simple map of our new gent, given our new one.

```go-html-template
{{/* /layouts/partials/transform_gent.html */}}
{{ return dict
  "lastname" .lastname
  "firstname" .lastname
  "fullname" (print .firstname " " .lastname)
  [etc...]
}}
```

## Inside our transformer

Nice. Now let's focus on the content of `transform_gent.html`, it's a bit naive as it is. We're assuming all those keys have been filled. 
But what if there is no instruments? Then we should probably do not use delimit, and simply return an empty slice!
What if we're missing a `.birthday`, then that `time` function will probably fail!

We cannot simply declare our `dict` in one shot anymore. We have to increment the additions of key/value pairs based on certain conditions. 

I know we've covered `merge` to achieve this. But there is one serious problem with the `merge` technique, it's pretty slow. If you only have a few hundred gents, it should be okay, but if you need to transform thousands of gents, you'll end up bumping your build time considerably. The reasonable approach is `Scratch`. Scratch is seldom used these days but it remains the best solution to modify maps!

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

First store our scratch instance in a `$s` variable. All its methods and data will be stored in there.
Then we store an empty map in our scratch called `"gent"`
Right after that we'll proceed to our various conditions and data manipulations.
At the end, we return the `"gent"` map stored in the `$s` Scratch.

We the proceed to test for the `.birthdate` key. `with` will work if that key is filled by anything. It will fail if it holds a falsy value like `false` or an emtpy string or emtpy slice or an emtpy map.
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




