import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

async function run() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('Usage: node optimizer.mjs <input> <output>');
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
    let document;
    try {
      document = await io.read(inputPath);
    } catch (readErr) {
      console.error('Read error (Corrupt GLB):', readErr);
      process.exit(2);
    }
    
    console.log('Optimizing (dedup + draco)...');
    try {
      await document.transform(
        dedup(),
        weld(),
        draco({ method: 'edgebreaker', quantizationVolume: 'mesh' })
      );
    
      console.log('Writing optimized document...');
      await io.write(outputPath, document);
    } catch (transformErr) {
      console.error('Transform/Write error:', transformErr);
      process.exit(3);
    }
    
    console.log('Optimization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Unknown setup error:', err);
    process.exit(1);
  }
}

run();
