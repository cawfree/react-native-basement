## about this project

[react-native-basement](https://github.com/cawfree/react-native-basement) provides a simple, extensible interface for caching any kind of remote data on your frontend. You've probably already seen that there are many existing solutions for caching, but these are almost ubiquitously coupled with the type of component they're designed for. 

There are a couple of drawbacks to this approach:

  - fine tuning is restricted to the capabilities of the library
  - they usually require bespoke parameters which increase the complexity of making migrations between libraries
  - you cannot manipulate the underlying technology, which usually necessitates accommodating multiple serialization engines

And more often than not? Caching isn't available, and you have to roll your own.

Now, there's a reason why this approach is the common case for contemporary libraries. Different [**React**](https://reactjs.org/) components require data to be presented in certain forms, and therefore no one caching mechanism is suitable to return the desired representation for all scenarios. Therefore, the way the caching problem is usually modelled is that for a given input, you expect a certain output. But this isn't conducive to code reuse, or minimizing your bundle size.

This project aims to provide a suitable template for defining a _generic_ cache. This way, we can mix and match either predefined or your own custom caching methodologies to support arbitrary data, independently of the methods of presentation, with the assurance that the data will fundamentally be persisted appropriately.

This is achieved by providing a [**hook**](https://reactjs.org/docs/hooks-intro.html) which accepts the following parameters:

  - a data source to cache against (i.e. a `uri`)
  - a method of retrieving the specified data (i.e. `fetch()`)
  - a method of caching the retrieved data (i.e. `writeFile()`)

This way, we can roll out arbitrary caching mechanisms to support equally arbitrary components or scenarios. This promotes the reuse of a uniform interface, and is not limited in scope.

## enough talk, how does it work

Let's say we want to use [react-native-svg](https://github.com/react-native-community/react-native-svg) to render a vector image specified by a `uri`, but we don't want to have to make the network call _every single time_ we wish to mount the graphic. 

We'll start with the basic layout of our Component, which we'll call the `CachedSvg`:

```javascript
import "react";
import {SvgXml} from "react-native-svg";

const CachedSvg = ({ uri, ...extraProps }) => {
  return (
    <SvgXml
      {...extraProps}
      xml={???}
    />
  );
};
```

Now, we need some way to convert the `uri` prop into the corresponding `xml` string. Additionally, let's choose to persist our data in persistent storage, so we can avoid further network calls. To do this, we'll rely upon the following _optional_ exports:

  - The `raw` **Getter** function, which when invoked will return the unmodified HTTP GET response for the specified given `uri`.
  - The `json` **Options** object, which will persist the returned data as a `String` via [`react-native-fs`]().
    - `react-native-fs` is not installed by default by this module; it will need to be installed to the host project separately.
  - The `useBasement` hook, which manages interaction between the **Getter** and the **Options** to minimize the number of network calls and maximize fast lookup via an in-memory cache.

```javascript
import "react";
import {SvgXml} from "react-native-svg";

import {useBasement} from "react-native-basement";
import {raw} from "react-native-basement/dist/getters/raw";
import {json} from "react-native-basement/dist/options/fs";

const cache = json({limit: 10}); /* cache a maximum of 10 items */

const CachedSvg = ({ uri, ...extraProps }) => {
  const [loading, value, error] = useBasement(uri, raw, cache);
  if (loading || error) {
    return null;
  }
  return (
    <SvgXml
      {...extraProps}
      xml={value}
    />
  );
};
```

In just a couple of lines, we now have an `SvgUri` component, not too dissimilar to [react-native-svg-uri](https://github.com/vault-development/react-native-svg-uri), with the added bonus of persistent caching of the SVG data.

Alternatively, we could have decided not to persist the SVG contents in device storage, and just rely upon the in-memory cache `mem`, instead:

```diff
import "react";
import {SvgXml} from "react-native-svg";

import {useBasement} from "react-native-basement";
import {raw} from "react-native-basement/dist/getters/raw";
+ import {mem} from "react-native-basement/dist/options/mem";
- import {json} from "react-native-basement/dist/options/fs";

+ const cache = mem({limit: 10}); /* cache a maximum of 10 items */
- const cache = json({limit: 10}); /* cache a maximum of 10 items */
```

The resulting performance will be identical, however the cache entries will be lost after the app is closed. This works well for scenarios where the rendered content changes frequently.

### a different example

The approach we've shown scales up to a lot of different applications. This time, let's imagine we want to cache a [Lottie Animation](https://github.com/react-native-community/lottie-react-native):

```javascript
import React from "react";
import Animation from "lottie-react-native";
import {DocumentDirectoryPath} from "react-native-fs";

import {useBasement} from "react-native-basement";
import {raw} from "react-native-basement/dist/getters/raw";
import {json} from "react-native-basement/dist/options/fs";

/* this time, let's store the different types of data in different basements so we can apply alternate caching mechanisms  */
const Basements = Object.freeze({
  svg: json({baseDir: `${DocumentDirectoryPath}/svg.basement`, limit: 10}),
  lottie: json({baseDir: `${DocumentDirectoryPath}/lottie.basement`, limit: 10}),
});

const CachedAnimation = ({ uri, ...extraProps }) => {
  const [loading, source, error] = useBasement(uri, raw, Basements.lottie);
  if (loading || error) {
    return null;
  }
  return (
    <Animation
      {...extraProps}
      source={source}
    />
  );
};
```

And just like that, now we can use persistent caching for Lottie animations, using an oddly similar interface to what we used in the `CachedSvg`.  Cool, huh?
