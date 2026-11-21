import {
  BoxGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, PerspectiveCamera, PlaneGeometry, Raycaster, Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function createLabPhone(room: Object3D) {
  const group = new Group();
  const handset = new Group();
  handset.name = "target_phone";
  const bed = room.getObjectByName("Single bed with a quilted cover");
  room.updateMatrixWorld(true);
  const ray = new Raycaster(new Vector3(-2.92, 1.2, 1.12), new Vector3(0, -1, 0));
  const surface = bed && ray.intersectObject(bed)[0];
  const rest = new Vector3(-2.92, (surface?.point.y ?? .59) + .011, 1.12);
  handset.position.copy(rest);
  handset.rotation.set(-Math.PI / 2, 0, -.16);
  const restingRotation = handset.quaternion.clone();
  const casing = new MeshStandardMaterial({ color: "#657b78", roughness: .58 });
  const glass = new MeshStandardMaterial({ color: "#101a1e", roughness: .38 });
  const body = new Mesh(new RoundedBoxGeometry(.154, .306, .021, 3, .009), casing);
  const bezel = new Mesh(new RoundedBoxGeometry(.148, .299, .007, 3, .003), glass);
  bezel.position.z = .009;
  const button = new Mesh(new BoxGeometry(.005, .037, .008), casing);
  button.position.set(.077, .057, 0);
  const display = new Mesh(new PlaneGeometry(.137, .283), new MeshBasicMaterial({ color: "white" }));
  display.position.z = .013;
  display.visible = false;
  handset.add(body, bezel, button, display);
  const eye = new Object3D();
  eye.name = "eye_phone";
  eye.position.copy(rest).add(new Vector3(.08, .57, .28));
  const aim = new Object3D();
  aim.name = "aim_phone";
  aim.position.copy(rest);
  group.add(handset, eye, aim);
  return {
    group, handset, display, rest, restingRotation,
    dispose() {
      for (const mesh of [body, bezel, button, display]) mesh.geometry.dispose();
      casing.dispose(); glass.dispose(); display.material.dispose();
    },
  };
}

// The viewer settles on the pillow, raises the phone, then moves into its screen.
export function phonePickup(camera: PerspectiveCamera, phone: ReturnType<typeof createLabPhone>) {
  const start = camera.position.clone();
  const startRotation = camera.quaternion.clone();
  const pillow = new Vector3(-3.76, .85, 1.04);
  const gaze = new Vector3(.22, 1, .03).normalize();
  const reclining = camera.clone();
  reclining.position.copy(pillow);
  reclining.up.set(1, 0, 0);
  reclining.lookAt(pillow.clone().add(gaze));
  const held = pillow.clone().addScaledVector(gaze, .44);
  const lifted = phone.rest.clone().add(new Vector3(0, .36, 0));
  return (seconds: number) => {
    const recline = MathUtils.smoothstep(seconds, 0, 1.15);
    const lift = MathUtils.smoothstep(seconds, .12, 1.26);
    const zoom = MathUtils.smoothstep(seconds, 1.48, 2.24);
    camera.position.lerpVectors(start, pillow, recline).addScaledVector(gaze, .17 * zoom);
    camera.quaternion.slerpQuaternions(startRotation, reclining.quaternion, recline);
    phone.handset.position.lerpVectors(phone.rest, lifted, lift)
      .lerp(held, lift);
    phone.handset.quaternion.slerpQuaternions(phone.restingRotation, reclining.quaternion, lift);
    const halfHeight = .27 * Math.tan(MathUtils.degToRad(camera.fov / 2));
    const fillZoom = Math.max(2 * halfHeight / .283, 2 * halfHeight * camera.aspect / .137);
    camera.zoom = MathUtils.lerp(1, Math.max(1, fillZoom * 1.04), zoom);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };
}
