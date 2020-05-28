## about this project

[react-native-basement]() provides a simple interface for permitting us to cache any kind of remote data for use in your frontend. You'll find that are many existing solutions for caching, but these are tightly coupled with the type of Component we wish to use to present the data.

There are a couple of drawbacks to this approach:

  - fine tuning is restricted to the capabilities of the library
  - they usually require bespoke parameters which increase the complexity of making migrations between libraries
  - if a library doesn't implement caching, you have to roll your own
  - you cannot manipulate the underlying technology, which usually necessitates accommodating multiple serialization engines

Now, there's a reason why this is the case for contemporary libraries. Different [React]() components require data to be presented in certain forms, and therefore no one caching mechanism is suitable to return the desired representation for all scenarios. Therefore, the way the caching problem is usually modelled is that for a given input, you expect a certain output.

This project aims to provide a suitable template for defining a _generic_ cache. This way, we can mix and match predefined or custom caching methodologies to support arbitrary data, and arbitrary methods of presentation, with the assurance that the data will fundamentally be persisted appropriately. This is achieved by providing a [hook]() which accepts the following parameters:

  - a data source to cache against
  - a method of retrieving the specified data
  - a method of caching the retrieved data

This way, we can scale up an arbitrary caching system to support equally arbitrary components or scenarios, and promote the reuse of a uniform interface. All the while, ensuring we don't restrict the capabilities of the target presentation component, such as by allocating an opinionated wrapper component or a restricted interface.

## enough talk, how does it work

It's best to start with an example. Let's say we want to use [react-native-svg]() to render a vector image specified by a URL, but we don't want to have to make the network call every time we wish to present the graphic. Additionally, let's make it so that the vector is retained for our next execution, long after the device has turned off.

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

Now, we need some way to convert the `uri` prop into the corresponding `xml` string. Additionally, we'll choose to persist our data in persistent storage, so we can avoid further network calls. To do this, we'll rely upon the following _optional_ exports:

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

In just a couple of lines, we now have an `SvgUri` component, not too dissimilar to [react-native-svg-uri](), with the added bonus of persistent caching of the SVG data.

If we didn't want to persist the SVG contents in device storage, we could rely upon the in-memory cache `mem`, instead:

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

The resulting performance will be identical, however the cache entries will be lost after the app is closed.
