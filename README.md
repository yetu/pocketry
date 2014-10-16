Custom tiles layout library with built-in drag'n'drop support and CSS3 animations.

See the [example](https://bitbucket.org/yetu/apphome-pocketry/raw/master/index.html).


## Concepts

We have a grid with tile elements of various size.

Those tiles are "sortable" by user.

The grid have the custom layout algorithm:

1. Split the container element in cells.
2. Split the layout in rows.
3. Layout the given tiles inside the row in top-right direction.
4. If tile cannot be placed in a row - go to the next row (presume the initial tiles order)

### Tile types and grid size

We have 3 predefined (hardcoded) tile sizes:

* `pin` - 1x1 tile
* `app` - 2x2 tile
* `feed` - 3x2 tile

### Grid size

Currently the library determines the width of the grid **automatically** based on the container DOM element width.

The height of each *layout row* is equals **2 grid cells** by default.

The number of rows is **unlimited** (rows added on demand during the layout phase).

### Algorithm visualization

![algo animation](https://bitbucket.org/yetu/apphome-pocketry/raw/master/example/algo-animation.gif)


## Install it

Install the component using:

`bower install yetu/pocketry`

and then add the script to your page:

`<script src="bower_components/pocketry/dist/pocketry.min.js"></script>`

## Use it

The current implementation assumes that you have tile elements **rendered in DOM before** you init the library.

```javascript
var grid = new Pocketry('.tiles', 2);

```

### Pocketry(container, rowSpan, options)
Creates the whole grid with layout rules and drag'n'drop feature in the specified *container* element.

### container
The selector of the element which will be turned into the grid.

### rowSpan
The height of each layout row.

### options.slotSize (default= 100)
The size of the grid cell in pixels.

### options.filterClass (default= 'is-hidden')
All DOM elements within the container, which have the specified class, **will not be turned into tiles**.


## Specifying tiles parameters

Each tile is represented by a single DOM element.

This element can have this attributes:

* `data-type` - the type of the tile (`pin`, `feed` or `app`)
* `data-freezed` - the element cannot be moved by user interaction


## Events API

The grid instance will fire some events during the lifetime.

You can add listeners using the code:

`grid.subscribe(eventName, fn);`

### relayout
This event is triggered when the grid relayout has happened.

## Grid API

### grid.TILES
The list of all available tile types, which can be used as `data-type` attributes.

### grid.layout
The model of the current layout.


# Contributing

* install [Bower](http://bower.io)
* `bower install` downloads third-party components
* open `index.html` in a reasonably modern browser


## Building

* install [Gulp](http://gulpjs.com)
* `gulp dist` creates release files in `./dist`

**Note:** in this case the package will not be checked in.

## Packaging

* `gulp patch` makes v0.1.0 → v0.1.1
* `gulp minor` makes v0.1.1 → v0.2.0
* `gulp major` makes v0.2.0 → v1.0.0

**Note:** All this commands will **commit & push** the changes to `master`!

# Contributors