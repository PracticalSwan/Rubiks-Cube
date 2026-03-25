export function createRubiksCubeApp({
  rubiksCube,
  controls,
  renderer,
  scene,
  camera
}) {
  const tick = (delta = 1 / 60) => {
    rubiksCube.group.rotation.x += 0.01;
    rubiksCube.group.rotation.y += 0.01;
    rubiksCube.update(delta);
    controls.update();
    renderer.render(scene, camera);
  };

  const solve = async (moves) => rubiksCube.playSolution(moves);

  return { tick, solve };
}
