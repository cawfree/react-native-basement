# Example

In this example, we show how `react-native-basement` can be used to cache image data, a common requirement in many production applications. Using a single hook, image data can be reliably persisted between full reloads of the application.

This example makes use of the following **optional** modules:

```
import {json} from "react-native-basement/options/fs"; // used to persist javascript objects as serialized strings
import {base64} from "react-native-basement/getters/base64"; // download contents of a url to a generic base64 string
```

These respectively require additional dependencies to be installed to the host project:

```bash
yarn add react-native-fs axios buffer
pod install # ios only
react-native run-ios #run-android
```
