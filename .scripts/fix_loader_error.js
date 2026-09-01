const fs = require('fs');
let p = 'frontend/js/app.js';
let content = fs.readFileSync(p, 'utf8');

const target = `    } catch (e) {
      console.error('Init error:', e);
      // Still render chips and try map with empty projects
      renderCategoryChips();
      renderMap();
    }`;

const replacement = `    } catch (e) {
      console.error('Init error:', e);
      // Still render chips and try map with empty projects
      renderCategoryChips();
      renderMap();
    } finally {
      if (typeof window.hideLoader === 'function') window.hideLoader();
    }`;

content = content.replace(target, replacement);

// Also remove it from the try block to avoid calling it twice
content = content.replace(`      renderMap();\n      if (typeof window.hideLoader === 'function') window.hideLoader();\n    } catch (e)`, `      renderMap();\n    } catch (e)`);

fs.writeFileSync(p, content);
console.log("Fixed loader not hiding on error");
