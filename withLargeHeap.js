const { withAndroidManifest } = require('expo/config-plugins');

const withLargeHeap = (config) => {
    return withAndroidManifest(config, (config) => {
        const application = config.modResults.manifest.application?.[0];

        if (application) {
            application.$ = {
                ...application.$,
                'android:largeHeap': 'true',
            };
        }

        return config;
    });
};

module.exports = withLargeHeap;
