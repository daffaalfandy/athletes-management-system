import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as path from 'path';
import * as fs from 'fs';

// Helper function to copy directory recursively
function copyDirSync(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
  },
  rebuildConfig: {
    // Rebuild native modules for the target platform
    force: true,
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
    }),
  ],
  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      // Smart dependency copier - only copies externalized modules and their dependencies
      // This is much more efficient than copying the entire node_modules (~50MB vs ~1GB)

      const projectRoot = process.cwd();
      const nodeModulesSource = path.join(projectRoot, 'node_modules');
      const nodeModulesDest = path.join(buildPath, 'node_modules');

      console.log('[Forge Hook] ========================================');
      console.log('[Forge Hook] Smart dependency copy starting...');
      console.log(`[Forge Hook] Source: ${nodeModulesSource}`);
      console.log(`[Forge Hook] Destination: ${nodeModulesDest}`);

      // These are the top-level modules that Vite externalizes
      const externalizedModules = ['better-sqlite3', 'pdfkit'];

      // Track which modules we've already copied to avoid duplicates
      const copiedModules = new Set<string>();

      // Function to get dependencies from a module's package.json
      function getModuleDependencies(moduleName: string): string[] {
        try {
          const pkgPath = path.join(nodeModulesSource, moduleName, 'package.json');
          if (!fs.existsSync(pkgPath)) return [];

          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          return Object.keys(pkg.dependencies || {});
        } catch {
          return [];
        }
      }

      // Recursively copy a module and all its dependencies
      function copyModuleWithDeps(moduleName: string): void {
        // Handle scoped packages (e.g., @swc/helpers)
        const normalizedName = moduleName.startsWith('@')
          ? moduleName
          : moduleName.split('/')[0];

        if (copiedModules.has(normalizedName)) return;

        const src = path.join(nodeModulesSource, normalizedName);
        const dest = path.join(nodeModulesDest, normalizedName);

        if (!fs.existsSync(src)) {
          console.log(`[Forge Hook] ⚠ Module not found: ${normalizedName}`);
          return;
        }

        // Copy the module
        copyDirSync(src, dest);
        copiedModules.add(normalizedName);
        console.log(`[Forge Hook] ✓ Copied: ${normalizedName}`);

        // Recursively copy dependencies
        const deps = getModuleDependencies(normalizedName);
        for (const dep of deps) {
          copyModuleWithDeps(dep);
        }
      }

      // Start copying from externalized modules
      console.log(`[Forge Hook] Externalized modules: ${externalizedModules.join(', ')}`);

      for (const moduleName of externalizedModules) {
        copyModuleWithDeps(moduleName);
      }

      console.log(`[Forge Hook] ----------------------------------------`);
      console.log(`[Forge Hook] Total modules copied: ${copiedModules.size}`);
      console.log('[Forge Hook] Smart dependency copy completed.');
      console.log('[Forge Hook] ========================================');
    },
  },
};

export default config;
