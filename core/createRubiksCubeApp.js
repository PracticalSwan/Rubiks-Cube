// Small scene adapter that centralizes frame updates, idle spin behavior, and button-driven zoom.
export function createRubiksCubeApp({
  rubiksCube,
  controls,
  renderer,
  scene,
  camera,
  shouldAutoSpin = () => true,
}) {
  // Keep zoom behavior button-driven so orbit rotation remains usable without wheel or pinch scaling.
  const clampDistance = (distance) =>
    Math.min(Math.max(distance, controls.minDistance), controls.maxDistance);

  const getCameraOffset = () => camera.position.clone().sub(controls.target);
  const getDistance = () => getCameraOffset().length();
  let viewTween = null;

  function applyCameraPose(position, up) {
    camera.position.copy(position);
    camera.up.copy(up).normalize();
    controls.update();
  }

  function cancelViewTween() {
    viewTween = null;
  }

  // Face locking is handled as a short camera tween so face changes feel intentional instead of abrupt.
  function focusView(view, { duration = 0.22, immediate = false } = {}) {
    const distance = getDistance() || 8;
    const targetPosition = controls.target.clone().add(
      camera.position
        .clone()
        .set(...view.eyeDirection)
        .normalize()
        .multiplyScalar(distance)
    );
    const targetUp = camera.up
      .clone()
      .set(...view.upDirection)
      .normalize();

    if (immediate) {
      cancelViewTween();
      applyCameraPose(targetPosition, targetUp);
      return;
    }

    viewTween = {
      duration,
      fromPosition: camera.position.clone(),
      fromUp: camera.up.clone(),
      progress: 0,
      toPosition: targetPosition,
      toUp: targetUp,
    };
  }

  function setDistance(nextDistance) {
    const currentOffset = getCameraOffset();
    const currentDistance = currentOffset.length();
    const clampedDistance = clampDistance(nextDistance);

    if (!currentDistance || Math.abs(clampedDistance - currentDistance) < 0.001) {
      return false;
    }

    camera.position.copy(
      controls.target.clone().add(currentOffset.normalize().multiplyScalar(clampedDistance))
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

    if (viewTween) {
      viewTween.progress = Math.min(1, viewTween.progress + delta / viewTween.duration);
      const easedProgress = 1 - (1 - viewTween.progress) ** 3;

      applyCameraPose(
        viewTween.fromPosition.clone().lerp(viewTween.toPosition, easedProgress),
        viewTween.fromUp.clone().lerp(viewTween.toUp, easedProgress)
      );

      if (viewTween.progress >= 1) {
        cancelViewTween();
      }
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
    cancelViewTween,
    focusView,
    isViewTweening: () => Boolean(viewTween),
    zoomIn: () => setDistance(getDistance() * 0.84),
    zoomOut: () => setDistance(getDistance() * 1.18),
  };
}
