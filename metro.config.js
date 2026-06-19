const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// __dirname is the absolute project root (e.g. /home/.../Tefama -mobile).
// Passing it explicitly fixes module resolution when the directory name
// contains spaces, which can cause Metro to compute wrong nodeModulesPaths.
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

module.exports = config;
