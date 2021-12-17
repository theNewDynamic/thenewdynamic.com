---
authors:
  - persons/regis-philibert.md
featured: /uploads/hugo-module-imgix.png
date: 2021-01-18T9:32:27.000Z
twitter_description: |- 
  We love @imgix but in order to fully integrate this amazing image optimization service into our everyday workflow, we had to solve some problems! The solution came in the form of an open source @GoHugoIo Module! 
  This article is about the whys-and-hows of TND's Imgix Hugo Module.
  
  #ssg #imgix #hugo #modules
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

## Slices

Slices are flat arrays, they can be made of strings, maps, Pages etc... What matters is that each entry be of the same types.

Creating a slice

```
{{ $gents := slice "John" "Paul" }}
{{ range $gents }}
I love {{ . }}
{{ end }}
```

Will print:
I love John
I love Paul

Adding to a slice
We use the `append` function. It takes two parameter. First parameter, is what we add to the slice, second parameter is the slice in question.
So something like:

```
{{ $gents = append "Ringo" $gents }}
```
            Append Ringo to the Gents
Note that if your first argument is a another slice, it'll add all its entries!

```
{{ $gents = append (slice "Ringo" "George") $gents }}
```
            Append Ringo and George to the Gents
Now we'll have:
I love John
I love Paul
I love Ringo
I love Ringo
I love George

Oops, Ringo's been added twice, once as a string, once as part of that [Ringo George] slice, no sweat we can use `uniq` to ensure there's no duplicate:

```
{{ $gents = uniq $gents }}
```

Prepend!
Sure, there's no "prepend" function, prepend will do. Instead of adding Ringo (1st argument) to the slice [John Paul] (2nd argument) we want to add the slice [John, Paul] to the slice [Ringo]... We just revert the argument order and make sure Ringo a slice:

```
{{ $gents = append $gents (slice "Ringo") }}
```
            Append the Gents to Ringo

Note:
Go Template has pipe thing that allows to chain functions. The offsetting thing is the left part will be passed as the last argument. And when you append to a slice, the order matter.

```
{{ $gents = $gents | append "Ringo" }}
```
  Append "Ringo" to the Gents OR
  The Gents are takin Ringo in... shrug

Index!

If you want to retrieve the index from a range on a slice, you can actually store it alongside the value at cursor like this:

```
{{ range $index, $gent := $gent }}
  {{ $gent }} is at index {{ $index }}
{{ end }}
```
Will print:
```
John is at index 0
Paul is at index 1
Ringo is at index 2
```

Yep, pretty much like in any programming language, index starts at 0. Note that even though our value is now stored in a `$value` variable, it remains available in the `.`.
```
{{ range $index, $value := $gent }}
{{ . }} is at index {{ $index }}
{{ end }}
```
## Maps

Maps are associative array, meanning you've got keys and values.

To create a map we use the `dict` function. It takes a unlimited set of even parameters.

```
{{ $gent := dict "firstame" "John" "lastname "Lennon" }}
```
Since Hugo ? we can break lines within statements, to create something much more readable like:
```
{{ $gent := dict 
  "firstame" "John"
  "lastname" "Lennon"
}}

Firsname: {{ $gent.firstname }}
Lastname: {{ $gent.lastname }}
```
Will print:
```
Firstname: John
Lastname: Ringo
```

How to append to a map

The simplest way is using the merge function. The merge function takes two argument, two maps which will be merged together. More on that later. But by creating a new map with new pair of key values and merging on top of the existing one, we add to a map:

```
{{ $gent = merge $gent (dict "birth" "1940-10-09" ) }}
```

We range on the map the same we do a slice. Index is also available, although this time it holds our key.

```
{{ range $key, $value := $gent }}
  {{ $key }}: {{ $value }}
{{ end }}
```
Will print:
```
birth: 1940-10-09
firstame: John
lastname: Lennon
```

You'll notice that the order does not follow the one we used. That's because Hugo (Go) systemattically re-order map by their keys. Slice on the other hand will always keep their defined order.

Now that gent played many instruments, we'll only add the few he played with the group.

```
{{ $gent = merge $gent (
  "instruments" slice
    "Piano"
    "Guitar"
    "Vocals
) }}
```

Now our `range` will print:

```
birth: 1940-10-09
firstame: John
instruments: [Piano Guitar Vocals]
lastname: Lennon
```

Instruments does not look too good though! We should test if our value is a slice, and behave appropriately. We'll use `delimit` to join the slice's value into a string with a comma as delimiter. 

Hugo cannot test for any type, but it does for those two we just covered. 
`reflect.IsSlice` and `reflect.IsMap`.

Here we go:
```
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

```
birth: 1940-10-09
firstame: John
instruments: Piano, Guitar, Vocals
lastname: Lennon
```

Now let's mix slices and maps yeah!

We'll create a slice of maps. We already have one gent so we "instantiate" our slice with him:

```
{{ $gents := slice $gent }}
```

Now we can add a new gent in a readable way with linebreaks and pipes:

```
{{ $gents = $gents | append (dict
  "firstame" "Paul"
  "lastname" "McCartney"
  "birth" "1942-06-18"
  "instruments" (slice
    "Bass Guitar"
    "Guitar"
    "Vocals"
    )
) }}
```

And in order to add our the last two, we can append a slice of the two:

```
{{ $gents = $gents | append (slice
  (dict
    "firstname" "Ringo"
    "lastname" "Starr"
    "birth" "1940-07-07"
    "instruments" (slice
      "Drums"
      "Vocals
    )
  )
  (dict
    "firstname" "George"
    "lastname" "Harrison"
    "birth" "1943-02-25"
    "instruments" (slice
      "Guitar"
      "Sitar"
      "Vocals"
    )
  )
) }}
```

And now to browse our gents: 

```
{{ range $gents }}
  <p>
    {{ .firstname }} {{ .lastname }} was born on {{ .birth }}, he played {{ delimit .instruments ", " " and " }}
  </p>
{{ end }}
```
Will print: 

```
John Lennon was born on 1940-10-09, he played Piano and Guitar.

Paul McCartney was born on 1942-06-18, he played Bass Guitar and Guitar.

Ringo Starr was born on 1940-07-07, he played Drums.

George Harrison was born on 1943-02-25, he played Guitar and Sitar.
```

Retrieving informations from our band.

People are using `where` clause all the time to filter out pages, but you can use it on any kind of collections, slices as well.

Let's find all gents born in 1940. As you know, `where` returns a slice empty or not, so it's safe to use range/else on it.

```
{{ range where $gents "birth" "1940" }}
    <p>{{ .firstname }}, {{ .birth }}</p>
{{ else }}
  No gents shrug!
{{ end }}
```

Now all the gents not born in 1940:

```
{{ $gents := where $gents "birth" "!=" "1940" }}
```

Or born in or after 1942
```
{{ $gents := where $gents "birth" ">=" "1942" }}
```

Note that type must be the same, here we're using string, if we had been using int for our $gents we should have use 1942 (int) as comparison.

Or born in 1942 or 1940

```
{{ $gents := where $gents "birth" "in" (slice "1940" "1942") }}
```

Here we can use "in" to find gents whose birth year is in included in ["1940", "1942"]

Ok we've be playing with a string, let's up our game.

We want all gents playing the Guitar. 
It's different that with "in" as we want to find gents whose instruments lists includes "Guitar".

We'll use `intersect`. It compares a slice from the entries with a given slice, and only returns the entries where both slices "intersect".

[Guitar, Piano] and [Bass, Guitar] intersects (Guitar in common!)
[Guitar, Piano] and [Drums, Vocals] do not intersect! (nothing in common!)
[Guitar, Vocals] and [Drums, Vocals] do intersect, but with Vocals, not Guitar.

Now we only need one intersection, Guitar, so:
```
{{ $gents := where $gents "instruments" "intersect" (slice "Guitar") }}
```
And if we wanted to find the gents who played Guitar and Vocals, two intersections, we'd:

```
{{ $gents := where $gents "instruments" "intersect" (slice "Guitar" "Vocals") }}
```

## Sorting

Some of you might be familiar with the way [pages are sorted with Hugo](https://gohugo.io/templates/lists/#order-content) but this is only for pages, not any kind of colletions, like our gents.

For those there is a `sort` function.

Let's sort our gents by age using `.birth`:

```
{{ $gents := sort $gents "birth" }}
```

`sort` take a first parameter, the key we'll sort the collection by, and an optional second for the direction which defaults to ascending.

So to revere the order and have them younger to older:
```
{{ $gents := sort $gents "birth" "desc" }}
```

## Transforming.

Now let's dive into use this recently aquired knowledge about data maniuplation in Hugo. We'll output some data from the raw gets data we've configured up there. 

This is the structure for one gent:

"firstname" String (John)
"lastname" String (Lennon)
"birth" String ("1940-10-09")
"instruments" Slice of strings

Note that we've updated the birth string to include month and day.

Now this is ideally what we want to make available ot an API endpoint or a template:

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
We also turn have a `birthday` key which is now a Hugo Date, that you use with `.birthday.Year` or format any you please.
We've also created a `instruments` maps with various informations that we could use. 

For example to sort our gents by the number of instruments they play we could now do:

```
{{ $gents := sort $new_gents "instruments.number" }}
```

That's really good, but we should really compartment our transformer in returning partials. We want to make this cleaner:

```
{{ $new_gents := slice }}
{{ range $gents }}
  {{ $new_gents = $new_gents | append ("partial" "transform_gent" .)
{{ end }}
```

And from that partial we'd return a simple map of our new gent, given our new one.

```
{{/* /layouts/partials/transform_gent.html */}}
{{ return dict
  "lastname" .lastname
  "firstname" .lastname
  "fullname" (print .firstname " " .lastname)
  "birthday" (time .birthdate)
  "instruments" (dict
    "string_rep" (delimit .instruments ", " "and")
    "number" (len .instruments)
    "list" .instruments
  )
}}
```

Remember `apply`? It will allow us get rid of this `range`:

```
{{ $gents = apply $gents "partial" "transform_gent" "." }}
```
Nice. Now let's focus on the content of `transform_gent.html`, it's a bit naive right now. 

Now it would be nice to simply list their first names for our next examples without ranging. There's a neat trick called `apply`. It's function which take a slice as first parameter, a function as a second, and the given function's parameter as any subsequent parameters.

What it returns is a slice containing a list of the functions returned value. So if we wanted out of our `where` results to create a slice with the first names of our gents we could:

```
{{ $firstnames := apply $gents "index" "." "firstname" }}



