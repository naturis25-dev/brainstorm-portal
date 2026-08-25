const { NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { weld, dedup, resample, prune } = require('@gltf-transform/functions');
const draco3d = require('draco3dgltf');

async function run() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('Usage: node optimizer.js <input> <output>');
    process.exit(1);
  }

  try {
    const io = new NodeIO()
      .registerExtensions(ALL_EXTENSIONS)
      .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
      });
    
    console.log('Reading document...');
    const document = await io.read(inputPath);
    
    console.log('Transforming...');
    await document.transform(
      weld(),
      dedup(),
      resample(),
      prune()
    );
    
    console.log('Applying Draco Compression...');
    const { KHRDracoMeshCompression } = require('@gltf-transform/extensions');
    document.createExtension(KHRDracoMeshCompression)
      .setRequired(true)
      .setEncoderOptions({
        method: 1, // EdgeBreaker
        encodeSpeed: 5,
        decodeSpeed: 5
      });
  
    console.log('Writing document...');
    await io.write(outputPath, document);
    console.log('Optimization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Optimization failed:', err);
    process.exit(1);
  }
}

run();
