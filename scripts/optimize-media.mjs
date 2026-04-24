import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const screenshotsRoot = path.resolve(process.cwd(), 'public', 'screenshots');
const mediaDir = path.join(screenshotsRoot, 'media');
const sourceDir = path.join(mediaDir, 'source');
const generatedDir = path.join(mediaDir, 'generated');

const SCREEN_WIDTH = 720;
const SCREEN_WEBP_QUALITY = 78;
const VIDEO_CRF = 28;
const VIDEO_WEBM_CRF = 34;

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });

  if (result.error || result.status !== 0) {
    const message = result.error?.message ?? `${command} exited with code ${result.status}`;
    throw new Error(message);
  }
}

function listFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

function moveFile(fromPath, toPath) {
  if (!existsSync(fromPath)) {
    return false;
  }

  mkdirSync(path.dirname(toPath), { recursive: true });
  rmSync(toPath, { force: true });
  renameSync(fromPath, toPath);
  return true;
}

function sortByNumericSuffix(files, pattern) {
  return [...files].sort((a, b) => {
    const aMatch = a.match(pattern);
    const bMatch = b.match(pattern);
    const aNumber = Number(aMatch?.[1] ?? 0);
    const bNumber = Number(bMatch?.[1] ?? 0);
    return aNumber - bNumber;
  });
}

function migrateLegacyMedia() {
  const legacyFiles = listFiles(screenshotsRoot);

  legacyFiles
    .filter((name) => /^IMG_(\d+)\.PNG$/i.test(name))
    .forEach((name) => {
      if (moveFile(path.join(screenshotsRoot, name), path.join(sourceDir, name))) {
        console.log(`Moved legacy source screenshot ${name} -> media/source`);
      }
    });

  legacyFiles
    .filter((name) => /^screen_(\d+)\.png$/i.test(name))
    .forEach((name) => {
      if (moveFile(path.join(screenshotsRoot, name), path.join(generatedDir, name))) {
        console.log(`Moved legacy generated screenshot ${name} -> media/generated`);
      }
    });

  legacyFiles
    .filter((name) => /^screen_(\d+)\.webp$/i.test(name))
    .forEach((name) => {
      if (moveFile(path.join(screenshotsRoot, name), path.join(generatedDir, name))) {
        console.log(`Moved legacy generated screenshot ${name} -> media/generated`);
      }
    });

  const legacySourceVideoPath = path.join(screenshotsRoot, 'screen_rec_source.mp4');
  const legacyVideoPath = path.join(screenshotsRoot, 'screen_rec.mp4');
  const legacyWebmPath = path.join(screenshotsRoot, 'screen_rec.webm');

  if (moveFile(legacySourceVideoPath, path.join(sourceDir, 'screen_rec_source.mp4'))) {
    console.log('Moved legacy source recording screen_rec_source.mp4 -> media/source');
  }

  if (existsSync(legacyVideoPath)) {
    const sourceHasVideo =
      existsSync(path.join(sourceDir, 'screen_rec_source.mp4')) ||
      existsSync(path.join(sourceDir, 'screen_rec.mp4'));

    const targetPath = sourceHasVideo
      ? path.join(generatedDir, 'screen_rec.mp4')
      : path.join(sourceDir, 'screen_rec.mp4');

    if (moveFile(legacyVideoPath, targetPath)) {
      console.log(
        `Moved legacy recording screen_rec.mp4 -> media/${sourceHasVideo ? 'generated' : 'source'}`
      );
    }
  }

  if (moveFile(legacyWebmPath, path.join(generatedDir, 'screen_rec.webm'))) {
    console.log('Moved legacy recording screen_rec.webm -> media/generated');
  }
}

function getSourceScreenshots(files) {
  const numbered = sortByNumericSuffix(
    files.filter((name) => /^screen_(\d+)\.png$/i.test(name)),
    /^screen_(\d+)\.png$/i
  );

  if (numbered.length > 0) {
    return numbered;
  }

  return sortByNumericSuffix(
    files.filter((name) => /^IMG_(\d+)\.PNG$/i.test(name)),
    /^IMG_(\d+)\.PNG$/i
  );
}

function optimizeScreenshots() {
  const files = listFiles(sourceDir);

  const sourceScreenshots = getSourceScreenshots(files);

  if (sourceScreenshots.length === 0) {
    console.log('No screenshots found matching screen_x.png or IMG_xxxx.PNG');
    return;
  }

  const targetPngNames = [];
  const targetWebpNames = [];

  sourceScreenshots.forEach((sourceName, index) => {
    const screenNumber = index + 1;
    const targetPng = `screen_${screenNumber}.png`;
    const targetWebp = `screen_${screenNumber}.webp`;
    const sourcePath = path.join(sourceDir, sourceName);
    const targetPngPath = path.join(generatedDir, targetPng);
    const targetWebpPath = path.join(generatedDir, targetWebp);
    const tempPngPath = path.join(generatedDir, `${path.parse(targetPng).name}.tmp.png`);

    run('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      sourcePath,
      '-vf',
      `scale='min(${SCREEN_WIDTH},iw)':-2:flags=lanczos`,
      '-frames:v',
      '1',
      '-compression_level',
      '9',
      '-pred',
      'mixed',
      '-pix_fmt',
      'rgb24',
      tempPngPath
    ]);

    renameSync(tempPngPath, targetPngPath);

    run('cwebp', ['-quiet', '-mt', '-q', String(SCREEN_WEBP_QUALITY), targetPngPath, '-o', targetWebpPath]);

    targetPngNames.push(targetPng);
    targetWebpNames.push(targetWebp);
    console.log(`Optimized ${sourceName} -> ${targetPng}, ${targetWebp}`);
  });

  const generatedFiles = listFiles(generatedDir);

  const staleGenerated = generatedFiles.filter(
    (name) =>
      (/^screen_(\d+)\.png$/i.test(name) && !targetPngNames.includes(name)) ||
      (/^screen_(\d+)\.webp$/i.test(name) && !targetWebpNames.includes(name))
  );

  staleGenerated.forEach((name) => {
    rmSync(path.join(generatedDir, name), { force: true });
    console.log(`Removed stale generated file ${name}`);
  });
}

function optimizeVideo() {
  const videoPath = path.join(generatedDir, 'screen_rec.mp4');
  const sourceVideoPath = path.join(sourceDir, 'screen_rec_source.mp4');
  const sourceVideoPathAlternate = path.join(sourceDir, 'screen_rec.mp4');
  const tempOptimizedMp4Path = path.join(generatedDir, 'screen_rec.tmp.mp4');
  const optimizedWebmPath = path.join(generatedDir, 'screen_rec.webm');

  if (!existsSync(sourceVideoPath) && !existsSync(sourceVideoPathAlternate)) {
    console.log('No source screen recording found in media/source');
    return;
  }

  if (!existsSync(sourceVideoPath) && existsSync(sourceVideoPathAlternate)) {
    copyFileSync(sourceVideoPathAlternate, sourceVideoPath);
    console.log('Created source backup: screen_rec_source.mp4');
  }

  const inputVideo = existsSync(sourceVideoPath) ? sourceVideoPath : sourceVideoPathAlternate;

  run('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-i',
    inputVideo,
    '-vf',
    `fps=30,scale='min(${SCREEN_WIDTH},iw)':-2:flags=lanczos`,
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(VIDEO_CRF),
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    tempOptimizedMp4Path
  ]);

  renameSync(tempOptimizedMp4Path, videoPath);

  run('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-i',
    inputVideo,
    '-vf',
    `fps=30,scale='min(${SCREEN_WIDTH},iw)':-2:flags=lanczos`,
    '-an',
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    String(VIDEO_WEBM_CRF),
    '-row-mt',
    '1',
    optimizedWebmPath
  ]);

  console.log('Optimized screen recording -> screen_rec.mp4, screen_rec.webm');
}

function main() {
  mkdirSync(screenshotsRoot, { recursive: true });
  mkdirSync(sourceDir, { recursive: true });
  mkdirSync(generatedDir, { recursive: true });
  migrateLegacyMedia();
  optimizeScreenshots();
  optimizeVideo();
  console.log('Media optimization complete.');
}

main();
