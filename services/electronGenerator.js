const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const { promisify } = require('util');
const config = require('../config/config');

const execAsync = promisify(exec);

// Ensure directories exist
async function ensureDirectories() {
  await fs.ensureDir(config.tempDir);
  await fs.ensureDir(config.outputDir);
}

async function createProjectStructure(code, sessionId) {
  const projectPath = path.join(config.tempDir, sessionId);

  console.log(`📁 Création de la structure du projet: ${projectPath}`);

  // Clean and create project directory
  await fs.remove(projectPath);
  await fs.ensureDir(projectPath);

  // Write all files
  for (const [filename, content] of Object.entries(code.files)) {
    const filePath = path.join(projectPath, filename);

    // Ensure parent directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`  ✓ ${filename}`);
  }

  // Ensure package.json has electron-builder config
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);

    // Add build configuration if missing
    if (!packageJson.build) {
      packageJson.build = {
        appId: `com.forja.${sessionId}`,
        productName: packageJson.name || 'ForjaApp',
        directories: {
          output: 'dist'
        },
        win: {
          target: ['nsis'],
          icon: 'build/icon.ico'
        },
        mac: {
          target: ['dmg'],
          icon: 'build/icon.icns',
          category: 'public.app-category.productivity'
        },
        linux: {
          target: ['AppImage'],
          icon: 'build/icon.png',
          category: 'Utility'
        }
      };
    }

    // Ensure electron-builder is in devDependencies
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    if (!packageJson.devDependencies['electron-builder']) {
      packageJson.devDependencies['electron-builder'] = '^24.9.1';
    }
    if (!packageJson.devDependencies['electron']) {
      packageJson.devDependencies['electron'] = '^28.0.0';
    }

    // Add build script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    packageJson.scripts.build = 'electron-builder';

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log('  ✓ package.json configuré avec electron-builder');
  }

  return projectPath;
}

async function installDependencies(projectPath) {
  console.log('📦 Installation des dépendances...');

  try {
    const { stdout, stderr } = await execAsync('npm install', {
      cwd: projectPath,
      timeout: 300000 // 5 minutes max
    });

    if (stderr && !stderr.includes('npm WARN')) {
      console.warn('⚠️  Avertissements npm:', stderr);
    }

    console.log('✅ Dépendances installées');
    return true;
  } catch (error) {
    console.error('❌ Erreur installation:', error.message);
    throw new Error(`Installation des dépendances échouée: ${error.message}`);
  }
}

async function buildExecutables(code, platforms, sessionId) {
  await ensureDirectories();

  const startTime = Date.now();
  const projectPath = await createProjectStructure(code, sessionId);

  // Install dependencies
  await installDependencies(projectPath);

  console.log(`🔨 Construction des exécutables pour: ${platforms.join(', ')}`);

  // Map platform names to electron-builder targets
  const targetMap = {
    windows: 'win',
    mac: 'mac',
    linux: 'linux'
  };

  const targets = platforms.map(p => targetMap[p.toLowerCase()] || p).join(',');

  try {
    // Build with electron-builder
    const buildCommand = `npm run build -- --${targets}`;
    console.log(`🏗️  Commande: ${buildCommand}`);

    const { stdout, stderr } = await execAsync(buildCommand, {
      cwd: projectPath,
      timeout: 600000, // 10 minutes max
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    console.log('✅ Build terminé');

    // Find generated files
    const distPath = path.join(projectPath, 'dist');
    const files = await fs.readdir(distPath);

    console.log('📦 Fichiers générés:', files);

    // Create download URLs (in production, upload to S3/CDN)
    const downloadUrls = {};
    for (const platform of platforms) {
      const platformFiles = files.filter(f => {
        const lower = f.toLowerCase();
        if (platform === 'windows') return lower.endsWith('.exe') || lower.endsWith('.msi');
        if (platform === 'mac') return lower.endsWith('.dmg');
        if (platform === 'linux') return lower.endsWith('.appimage') || lower.endsWith('.deb');
        return false;
      });

      if (platformFiles.length > 0) {
        // In production, upload to storage and return URL
        // For now, just return local path
        downloadUrls[platform] = `/download/${sessionId}/${platformFiles[0]}`;
      }
    }

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);

    return {
      success: true,
      downloadUrls,
      buildTime: `${buildTime}s`,
      projectPath
    };

  } catch (error) {
    console.error('❌ Erreur de build:', error);
    throw new Error(`Build échoué: ${error.message}`);
  }
}

async function createZipArchive(projectPath, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✅ Archive créée: ${archive.pointer()} bytes`);
      resolve(outputPath);
    });

    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(projectPath, false);
    archive.finalize();
  });
}

// Export project as ZIP (without building)
async function exportProjectZip(code, sessionId) {
  await ensureDirectories();

  const projectPath = await createProjectStructure(code, sessionId);
  const zipPath = path.join(config.outputDir, `${sessionId}.zip`);

  await createZipArchive(projectPath, zipPath);

  return {
    success: true,
    downloadUrl: `/download/${sessionId}.zip`,
    projectPath
  };
}

module.exports = {
  buildExecutables,
  exportProjectZip,
  createProjectStructure,
  installDependencies
};
