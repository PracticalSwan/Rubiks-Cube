import { LineSegments, Mesh, MeshBasicMaterial } from 'three';

export function createCubieMeshFactory({
  cubieGeometry,
  edgeGeometry,
  edgeMaterial,
  materialFaces,
  getStickerColor,
}) {
  const materialCache = new Map();

  function getMaterialForSticker(sticker) {
    const color = getStickerColor(sticker);

    if (!materialCache.has(color)) {
      materialCache.set(color, new MeshBasicMaterial({ color }));
    }

    return materialCache.get(color);
  }

  function getMaterialsForStickers(stickers) {
    return materialFaces.map((face) => getMaterialForSticker(stickers[face]));
  }

  return function createCubieMesh(stickers) {
    const mesh = new Mesh(cubieGeometry, getMaterialsForStickers(stickers));
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();

    const edges = new LineSegments(edgeGeometry, edgeMaterial);
    edges.matrixAutoUpdate = false;
    edges.updateMatrix();
    mesh.add(edges);

    mesh.userData.applyStickers = (nextStickers) => {
      const nextMaterials = getMaterialsForStickers(nextStickers);
      const currentMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const materialChanged =
        currentMaterials.length !== nextMaterials.length ||
        nextMaterials.some((material, index) => currentMaterials[index] !== material);

      if (materialChanged) {
        mesh.material = nextMaterials;
      }
    };

    return mesh;
  };
}
