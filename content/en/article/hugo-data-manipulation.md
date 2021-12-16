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

You'll notice that the order does not follow the one we used. That's because Hugo (Go) systemattically re-order map by their keys.

Now that gent played many instruments, we'll add a few:

```
{{ $gent = merge $gent (
  "instruments" slice
    "Piano"
    "Guitar"
) }}
```

Now our `range` will print:

```
birth: 1940-10-09
firstame: John
instruments: [Piano Guitar]
lastname: Lennon
```

Instruments does not look too good though! We should test if our value is a slice, and behave appropriately. We'll use `delimit` to join the slice's value into a string with delimiter. 

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
instruments: Piano, Guitar
lastname: Lennon
```

Now let's mix slices and maps yeah!

We'll create a slice of maps. We already have one gent so we can add it