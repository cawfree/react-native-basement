// TODO: Use a suitable native lib for speed.
import axios from "axios";
import { Buffer } from "buffer";

// XXX: Returns the base64 string for the specified url.
export const base64 = (url) =>
  axios
    .get(url, { responseType: "arraybuffer" })
    .then(
      (response) =>
        `data:${response.headers["content-type"]};base64,${Buffer.from(
          response.data,
          "binary"
        ).toString("base64")}`
    );
