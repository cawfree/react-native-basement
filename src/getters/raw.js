import axios from "axios";

export const raw = uri => axios
  .get(uri).then(({data}) => data);
