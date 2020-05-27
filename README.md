# 📦 react-native-basement
[**React Native Basement**](https://github.com/cawfree/react-native-basement) defines a way to easily cache remote dependencies, whether they're images, JSON or raw file content. Using the [`useBasement`](https://github.com/cawfree/react-native-basement/blob/161ac2ee4beee0ac66edb9fc0c54836e16ccbb2a/src/index.js#L54) hook, extensible declarative resource caching is a breeze. 🌊

Caching a support is a little _patchy_ in React Native. There's [**iOS-only support for the Image component**](https://reactnative.dev/docs/images#cache-control-ios-only), or dedicated libraries for specific types.

If you're only interested in caching images, I'd suggest taking a look at [**react-native-cached-image**](https://github.com/kfiroo/react-native-cached-image). If you're interested in caching anything else, such as [**Videos**](https://github.com/react-native-community/react-native-video) or [**Lottie Animations**](https://github.com/react-native-community/lottie-react-native), then this project is your friend!

## 🚀 installing

```bash
yarn add react-native-basement # or npm -i -s react-native-basement
```

That's about it! Please check out the [**Getting Started**](./docs/GETTING-STARTED.md) guide for integration details. There's also an included [**Example App**](./example/App.js).

## ✌️ licence
[**MIT**](./LICENSE.md)
