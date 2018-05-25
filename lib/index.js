import { FileSystem } from 'expo';

export const DocumentDir = FileSystem.documentDirectory;
export const CacheDir = FileSystem.cacheDirectory;

const resolvePath = (...paths) => paths.join('/').split('/').filter(part => part && part !== '.').join('/');

// Wrap function to support both Promise and callback
async function withCallback(callback, func) {
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

const FSStorage = (location = DocumentDir, folder = 'reduxPersist') => {
  const baseFolder = resolvePath(location, folder);

  const pathForKey = key => resolvePath(baseFolder, encodeURIComponent(key));

  const setItem = (key, value, callback) => withCallback(callback, async () => {
    await FileSystem.makeDirectoryAsync(baseFolder, {
      intermediates: true
    });
    await FileSystem.writeAsStringAsync(pathForKey(key), value);
  });

  const getItem = (key, callback) => withCallback(callback, async () => {
    const pathKey = pathForKey(key);
    const { exists } = await FileSystem.getInfoAsync(pathKey);
    if (exists) {
      return await FileSystem.readAsStringAsync(pathKey);
    }
  });

  const removeItem = (key, callback) => withCallback(callback, async () => {
    await FileSystem.deleteAsync(pathForKey(key), {
      idempotent: true
    });
  });

  const getAllKeys = callback => withCallback(callback, async () => {
    await FileSystem.makeDirectoryAsync(baseFolder, {
      intermediates: true
    });
    const baseFolderLength = baseFolder.length;
    const files = await FileSystem.readDirectoryAsync(baseFolder);
    return files.map(fileUri => decodeURIComponent(fileUri.substring(baseFolderLength)));
  });

  return {
    setItem,
    getItem,
    removeItem,
    getAllKeys
  };
};

export default FSStorage;