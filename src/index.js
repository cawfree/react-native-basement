import { createContext, useContext, useState, memo } from "react";
import { typeCheck } from "type-check";
import seedrandom from "seedrandom";
import useDeepCompareEffect from "use-deep-compare-effect";

const loadingState = Object.freeze([true, null, null]);
const errorState = (message) =>
  Object.freeze([false, null, new Error(`${message}`)]);
const readyState = (value) => Object.freeze([false, value, null]);

const createDefaultContext = () => Object.freeze({});

const defaultContext = createDefaultContext();

const Context = createContext(defaultContext);

export const defaultOptions = Object.freeze({
  /* create a deterministic key for a given input */
  key: (e) => seedrandom(JSON.stringify(e)).int32(),
  load: (token) =>
    Promise.reject(
      new Error(
        `Basement: You must declare a load(token:String) method in your options.`
      )
    ),
  save: (token, result) =>
    Promise.reject(
      new Error(
        `Basement: You must declare a save(token:String, result:Any) method in your options.`
      )
    ),
});

const promisify = (fn) => Promise.resolve().then(fn);

const shouldFetch = (fetch, source) => promisify(() => fetch(source));

const shouldSave = (save, token, result) =>
  promisify(() => save(token, result)).then(() => result);

const shouldLoad = (load, token) => promisify(() => load(token));

const maybeFetch = (source, fetch, { key, load, save }) =>
  Promise.resolve(key(source)).then((token) =>
    shouldLoad(load, token).then(
      (result) =>
        result ||
        shouldFetch(fetch, source).then((result) =>
          shouldSave(save, token, result)
        )
    )
  );

export const useBasement = (source, fetch, options = defaultOptions) => {
  /* add methods for management, inspection etc */
  const {} = useContext(Context);
  const [state, setState] = useState(loadingState);

  /* prevent bad options */
  if (!typeCheck("Object", options)) {
    return (
      setState(
        errorState(`Expected Object options, encountered ${typeof options}.`)
      ) && undefined
    );
  }

  useDeepCompareEffect(() => {
    /* resolve options */
    const opts = Object.freeze({ ...defaultOptions, ...options });

    /* nothing to load */
    if (source === undefined || source === null) {
      return setState(readyState(source)) && undefined;
    } else if (!typeCheck("String", source) && !typeCheck("Object", source)) {
      return (
        setState(
          errorState(
            `Expected String|Object source, encountered ${typeof source}.`
          )
        ) && undefined
      );
    }

    /* invalid function */
    if (!typeCheck("Function", fetch)) {
      return (
        setState(
          errorState(`Expected Function fetch, encountered ${typeof fetch}.`)
        ) && undefined
      );
    } else if (!typeCheck("{key:Function,...}", opts)) {
      return (
        setState(
          errorState(
            `Expected Function options.key, encountered ${typeof opts.key}.`
          )
        ) && undefined
      );
    } else if (!typeCheck("{load:Function,...}", opts)) {
      return (
        setState(
          errorState(
            `Expected Function options.load, encountered ${typeof opts.load}.`
          )
        ) && undefined
      );
    } else if (!typeCheck("{save:Function,...}", opts)) {
      return (
        setState(
          errorState(
            `Expected Function options.save, encountered ${typeof opts.save}.`
          )
        ) && undefined
      );
    }

    /* begin loading */
    setState(loadingState);

    /* attempt fetch */
    return (
      maybeFetch(source, fetch, opts)
        .then((res) => setState(readyState(res)))
        .catch(({ message }) => setState(errorState(message))) && undefined
    );
  }, [source, fetch, options, setState]);

  return state;
};
