# Redux Persist FS Storage for Expo

[Redux Persist](https://github.com/rt2zz/redux-persist/) storage engine for React Native Expo file system, this will also work for [Apollo Persist](https://github.com/apollographql/apollo-cache-persist).

Credits to [techwes](https://github.com/techwes/redux-persist-expo-fs-storage) for porting this to the Expo FileSystem.

### Install

```
yarn add redux-persist-expo-fs-storage
```

### Usage

```js
import { persistStore } from 'redux-persist'
import FSStorage from 'redux-persist-expo-fs-storage';

const persistor = persistStore(store, {storage: FSStorage()});
```

The default storage location is a folder called `reduxPersist` in the document directory for your app on the device. You can specify folder for persistor:

```js
import { persistStore } from 'redux-persist'
import FSStorage, { CacheDir } from 'redux-persist-expo-fs-storage';

const cachePersistor = persistStore(store, {storage: FSStorage(CacheDir, 'myApp')});
```

This will create `myApp` folder in cache storage for iOS and Android devices. You may create multiple persistors on different directories.
