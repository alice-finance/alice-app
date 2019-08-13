# Alice App

## !!! RELEASE CHANNEL !!!

We use version as release channel! Use yarn scripts instead of using expo cli manually to prevent messing up release channel

## Publish

```shell script
yarn expo:publish
```

If you need to publish to release channel `test`:

```shell script
expo publish --release-channel test
```

## Build

Publish before build!!

### iOS

```shell script
yarn expo:build:ios
```

### Android

```shell script
yarn expo:build:android
```

### Build Manually

If you need new iOS build on release channel `test`: 

```shell script
expo build:ios --release-channel test --no-publish 
```

If you build android binary, append option `--type app-bundle` at the end of the command 

```shell script
expo build:android --release-channel test --no-publish --type app-bundle
```

## Upload

### iOS

```shell script
yarn expo:upload:ios
```

### Android

Upload generated file manually.
