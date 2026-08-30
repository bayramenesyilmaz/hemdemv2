const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
// pnpm monorepo kökü: packages/core buradan iki seviye yukarıda.
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// packages/core, apps/mobile'ın kendi node_modules'ı DIŞINDA (repo
// köküne symlink'lenmiş bir workspace paketi). Metro varsayılan olarak
// sadece projectRoot'u izler — repo kökü de watchFolders'a eklenmezse
// packages/core'daki bir değişiklik Expo Go'da yansımaz, uygulamanın
// yeniden başlatılması gerekir.
config.watchFolders = [workspaceRoot];

module.exports = config;
