Getting Started
---------------

* install [Bower](http://bower.io)
* `bower install` downloads third-party components
* open `index.html` in a reasonably modern browser


Building
--------

* install [Gulp](http://gulpjs.com)
* `gulp dist` creates release files in `./dist`

**Note:** in this case the package will not be checked in.

Bower package
-------------

* `gulp patch` makes v0.1.0 → v0.1.1
* `gulp minor` makes v0.1.1 → v0.2.0
* `gulp major` makes v0.2.0 → v1.0.0

**Note:** All this commands will **commit & push** the changes to `master`!