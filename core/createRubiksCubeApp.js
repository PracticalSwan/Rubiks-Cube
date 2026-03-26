// Small scene adapter that centralizes frame updates, idle spin behavior, and button-driven zoom.
export function createRubiksCubeApp({
  rubiksCube,
  controls,
  renderer,
  scene,
  camera,
  shouldAutoSpin = () => true
}) {
  // Keep zoom behavior button-driven so orbit rotation remains usable without wheel or pinch scaling.
  const clampDistance = (distance) =>
    Math.min(Math.max(distance, controls.minDistance), controls.maxDistance);

  const getCameraOffset = () => camera.position.clone().sub(controls.target);
  const getDistance = () => getCameraOffset().length();

  function setDistance(nextDistance) {
    const currentOffset = getCameraOffset();
    const currentDistance = currentOffset.length();
    const clampedDistance = clampDistance(nextDistance);

    if (!currentDistance || Math.abs(clampedDistance - currentDistance) < 0.001) {
      return false;
    }

    camera.position.copy(
      controls.target
        .clone()
        .add(currentOffset.normalize().multiplyScalar(clampedDistance))
    );
    controls.update();
    return true;
  }

  // Idle motion is deliberately subtle and frame-rate independent so it behaves like a demo state, not gameplay.
  const tick = (delta = 1 / 60) => {
    if (shouldAutoSpin()) {
      rubiksCube.group.rotation.x += delta * 0.24;
      rubiksCube.group.rotation.y += delta * 0.65;
    }

    rubiksCube.update(delta);
    controls.update();
    renderer.render(scene, camera);
  };

  const solve = async (moves) => rubiksCube.playSolution(moves);

  return {
    tick,
    solve,
    canZoomIn: () => getDistance() > controls.minDistance + 0.05,
    canZoomOut: () => getDistance() < controls.maxDistance - 0.05,
    zoomIn: () => setDistance(getDistance() * 0.84),
    zoomOut: () => setDistance(getDistance() * 1.18),
  };
}
