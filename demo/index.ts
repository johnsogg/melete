import { VERSION } from '~/index';

console.log(`Melete version: ${VERSION}`);

// Demo will be expanded as we develop the library
const container = document.getElementById('canvas-container');
if (container) {
  container.innerHTML = '<p>Canvas will be rendered here...</p>';
}