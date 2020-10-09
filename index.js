/* @flow */
import * as FileSystem from 'expo-file-system';

export const DocumentDir = FileSystem.documentDirectory;
export const CacheDir = FileSystem.cacheDirectory;

const resolvePath = (...paths: Array<string>) =>
  paths
    .join('/')
    .split('/')
    .filter((part) => part && part !== '.')
    .join('/');

// Wrap function to support both Promise and callback
async function withCallback<R>(
  callback?: ?(error: ?Error, result: R | void) => void,
  func: () => Promise<R>,
): Promise<R | void> {
  try {
    const result = await func();
    if (callback) {
      callback(null, result);
    }
    return result;
  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }
}

const FSStorage = (
  location?: string = DocumentDir,
  folder?: string = 'reduxPersist',
) => {
  const baseFolder = resolvePath(location, folder);

  const pathForKey = (key: string) =>
    resolvePath(baseFolder, encodeURIComponent(key));

  const setItem = (
    key: string,
    value: string,
    callback?: ?(error: ?Error) => void,
  ): Promise<void> =>
    withCallback(callback, async () => {
      const { exists } = await FileSystem.getInfoAsync(baseFolder);
      if (exists == false) {
        await FileSystem.makeDirectoryAsync(baseFolder, {
          intermediates: true,
        });
      }
      await FileSystem.writeAsStringAsync(pathForKey(key), value);
    });

  const getItem = (
    key: string,
    callback?: ?(error: ?Error, result: ?string) => void,
  ): Promise<?string> =>
    withCallback(callback, async () => {
      const pathKey = pathForKey(key);
      const { exists } = await FileSystem.getInfoAsync(pathKey);
      if (exists) {
        return await FileSystem.readAsStringAsync(pathKey);
      }
    });

  const removeItem = (
    key: string,
    callback?: ?(error: ?Error) => void,
  ): Promise<void> =>
    withCallback(callback, async () => {
      await FileSystem.deleteAsync(pathForKey(key), {
        idempotent: true,
      });
    });

  const getAllKeys = (
    callback?: ?(error: ?Error, keys: ?Array<string>) => void,
  ) =>
    withCallback(callback, async () => {
      await FileSystem.makeDirectoryAsync(baseFolder, {
        intermediates: true,
      });

      const files = await FileSystem.readDirectoryAsync(baseFolder);
      return files.map((fileUri) => decodeURIComponent(fileUri));
    });

  return {
    setItem,
    getItem,
    removeItem,
    getAllKeys,
  };
};

export default FSStorage;
