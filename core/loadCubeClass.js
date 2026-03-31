// The solver entrypoint is loaded lazily so the first scene render stays lighter than the full cubejs payload.
let cubeClassPromise;

export async function loadCubeClass() {
  if (!cubeClassPromise) {
    cubeClassPromise = import('cubejs-local').then((module) => module.default);
  }

  return cubeClassPromise;
}
