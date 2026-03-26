let cubeClassPromise;

export async function loadCubeClass() {
  if (!cubeClassPromise) {
    cubeClassPromise = import('cubejs-local').then((module) => module.default);
  }

  return cubeClassPromise;
}
