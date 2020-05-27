import React, {useState, useCallback} from "react";
import {ActivityIndicator, Text, View, ScrollView, StyleSheet, SafeAreaView, Button, Image, Dimensions} from "react-native";

import {useBasement} from "react-native-basement";
import {json} from "react-native-basement/dist/options/fs";
import {base64} from "react-native-basement/dist/getters/base64";

const fs = json({limit: 1});

const styles = StyleSheet.create({
  flex: {flex: 1},
  bold: {fontWeight: "bold"},
  padding: {padding: 10},
});

const CachedImage = ({ source: {uri: requestedUri}, ...extraProps }) => {
  const [loading, uri, error] = useBasement(requestedUri, base64, fs);
  if (loading || error) {
    (!!error) && console.warn(error);
    return (
      <ActivityIndicator
      />
    );
  }
  return (
    <Image
      {...extraProps}
      source={{ uri }}
    />
  );
};

export default ({ ...extraProps }) => {
  const [possibleUris] = useState(() => [[3000,2000]]
    .map(
      ([w, h]) => `https://unsplash.it/${w}/${h}`
    ));
  const [uris, setUris] = useState([]);
  const onPress = useCallback(
    () => setUris(
      [...uris, possibleUris[Math.floor(possibleUris.length * Math.random())]],
    ),
    [setUris, uris],
  );
  return (
    <View
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView />
      <ScrollView
        style={styles.flex}
      >
        {uris.map(
          (uri, i) => (
            <CachedImage
              style={{ width: '100%',
                height: 100,
              }}
              resizeMode="cover"
              key={i}
              source={{ uri }}
            />
          ),
        )}
      </ScrollView>
      <Button
        title="Add Image"
        onPress={onPress}
      />
      <Text
        style={styles.padding}
      >
        <Text
          children="Pressing "
        />
        <Text
          style={styles.bold}
          children="Add Image"
        />
        <Text
          children=" will stream a pretty large image to disk. On the first load, it will take some time to process. However, subsequent presses will be almost instantaneous, even after the app has been closed. This is due to both "
        />
        <Text
          style={styles.bold}
          children="in-memory"
        />
        <Text
          children=" and "
        />
        <Text
          style={styles.bold}
          children="filesystem"
        />
        <Text
          children=" caching."
        />
      </Text>
      <SafeAreaView />
    </View>
  );
};
