const { withAndroidManifest, withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// 1. Copies Java files from your local plugins directory to the generated native build directory
function withBlockerJavaCode(config) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;

            // Define destination build target path inside the newly generated /android folder
            const targetDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', 'com', 'yourname', 'inertiashield');
            fs.mkdirSync(targetDir, { recursive: true });

            // Define your safe local source directories
            const localSrcDir = path.join(projectRoot, 'plugins', 'android-blocker', 'src');

            // File List to Copy across the build barrier
            const filesToCopy = ['AndroidBlockerService.java', 'BootReceiver.java'];

            filesToCopy.forEach((filename) => {
                const sourcePath = path.join(localSrcDir, filename);
                const destinationPath = path.join(targetDir, filename);

                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, destinationPath);
                    console.log(`[InertiaPlugin] Successfully copied ${filename} to native build path.`);
                } else {
                    console.error(`[InertiaPlugin] Error: Source file not found at ${sourcePath}`);
                }
            });

            return config;
        }
    ]);
}

function withAccessibilityServiceXml(config) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const resDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
            fs.mkdirSync(resDir, { recursive: true });

            const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://android.com"
    android:accessibilityEventTypes="typeWindowStateChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagIncludeNotImportantViews"
    android:canRetrieveWindowContent="false"
    android:description="@string/accessibility_service_description" />`;

            fs.writeFileSync(path.join(resDir, 'accessibility_service_config.xml'), xmlContent);
            return config;
        },
    ]);
}

function withAccessibilityStrings(config) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const stringsPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');

            if (fs.existsSync(stringsPath)) {
                let content = fs.readFileSync(stringsPath, 'utf8');
                if (!content.includes('accessibility_service_description')) {
                    const insertIdx = content.indexOf('</resources>');
                    const stringInjections = `    <string name="accessibility_service_description">InertiaShield requires this to temporarily prevent app access and break distraction loops.</string>\n`;
                    content = content.slice(0, insertIdx) + stringInjections + content.slice(insertIdx);
                    fs.writeFileSync(stringsPath, content);
                }
            }
            return config;
        }
    ]);
}

function withBlockerManifest(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults.manifest;
        const application = androidManifest.application;

        if (!application.service) application.service = [];
        if (!application.receiver) application.receiver = [];

        application.service.push({
            '$': {
                'android:name': 'com.yourname.inertiashield.AndroidBlockerService',
                'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
                'android:foregroundServiceType': 'specialUse',
                'android:exported': 'false'
            },
            'intent-filter': [
                {
                    action: [{ '$': { 'android:name': 'android.accessibilityservice.AccessibilityService' } }]
                }
            ],
            'meta-data': [
                {
                    '$': {
                        'android:name': 'android.accessibilityservice',
                        'android:resource': '@xml/accessibility_service_config.xml'
                    }
                }
            ]
        });

        application.receiver.push({
            '$': {
                'android:name': 'com.yourname.inertiashield.BootReceiver',
                'android:enabled': 'true',
                'android:exported': 'true'
            },
            'intent-filter': [
                {
                    action: [
                        { '$': { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
                        { '$': { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' } }
                    ]
                }
            ]
        });

        return config;
    });
}

module.exports = function withAndroidBlockerChain(config) {
    return withPlugins(config, [
        withAccessibilityServiceXml,
        withAccessibilityStrings,
        withBlockerJavaCode, // Injects the file-copier function into the Expo pipeline
        withBlockerManifest
    ]);
};
