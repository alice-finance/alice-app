const extraNodeModules = require("node-libs-react-native");

module.exports = {
    resolver: {
        extraNodeModules: {
            ...extraNodeModules,
            crypto: require.resolve("crypto-browserify"),
            vm: require.resolve("vm-browserify"),
            fs: require.resolve("./fs")
        }
    }
};
