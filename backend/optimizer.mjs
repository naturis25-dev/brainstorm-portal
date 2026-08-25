import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize } from '@gltf-transform/functions';

async function run() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('Usage: node optimizer.mjs <input> <output>');
    process.exit(1);
  }

  try {
    const io = new NodeIO()
      .registerExtensions(ALL_EXTENSIONS);
    
    console.log('Reading document...');
    const document = await io.read(inputPath);
    
    console.log('Optimizing (dedup + quantize)...');
    await document.transform(
      dedup(),
      quantize()
    );
  
    console.log('Writing optimized document...');
    await io.write(outputPath, document);
    console.log('Optimization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Optimization failed:', err);
    process.exit(1);
  }
}

run();
