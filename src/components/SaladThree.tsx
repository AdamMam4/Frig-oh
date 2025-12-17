import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function SaladThree({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // ensure the mount is a positioned container so the canvas can be absolutely positioned
    mount.style.position = mount.style.position || 'relative';
    // configure canvas so it captures pointer events and doesn't allow text-selection underneath
    const canvas = renderer.domElement as HTMLCanvasElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.pointerEvents = 'auto';
    // put canvas above page content so it receives pointer events (transparent background preserves visuals)
    canvas.style.zIndex = '1';
    mount.appendChild(canvas);

    // lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemi.position.set(0, 2, 0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 3, 2);
    scene.add(dir);

    // group for whole salad
    const group = new THREE.Group();
    scene.add(group);
    // No primitive bowl/salad here — the loaded GLB provides the full model
    // Keep a model container where the GLB will be attached

    // group where the gltf model will be attached once loaded
    const modelGroup = new THREE.Group();
    group.add(modelGroup);

    // passive scene state (no interactions)
    // GLTF loader to load model from public folder
    const loader = new GLTFLoader();
    let gltfScene: THREE.Object3D | null = null;
    loader.load('/Ramen.glb', (gltf) => {
      // attach and auto-fit the loaded model: center on origin and scale up 20%
      gltfScene = gltf.scene;
      // add to container first
      modelGroup.add(gltf.scene);

      // compute bounding box of the loaded scene
      const bbox = new THREE.Box3().setFromObject(gltf.scene);
      const center = bbox.getCenter(new THREE.Vector3());

      // re-center the model so its geometric center is at the origin
      gltf.scene.position.sub(center);

      // apply a uniform scale of 1.2 (20% larger)
      modelGroup.scale.setScalar(1.2);

      // lift the whole model so it visually centers with the surrounding text
      // raise by 0.15 to bring the bowl up towards center (size unchanged)
      modelGroup.position.y = 0.30;
    }, undefined, (err) => {
      console.error('Failed to load GLB', err);
    });

    // Pointer drag controls: allow user to rotate the loaded model with the mouse
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    function onPointerDown(e: PointerEvent) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      currentRotX = modelGroup.rotation.x;
      currentRotY = modelGroup.rotation.y;
      try { renderer.domElement.setPointerCapture(e.pointerId); } catch {}
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const sensitivity = 0.005; // tweak to taste
      targetRotY = currentRotY + dx * sensitivity;
      targetRotX = Math.max(-0.8, Math.min(0.8, currentRotX + dy * sensitivity));
    }

    function onPointerUp(e: PointerEvent) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
      currentRotX = targetRotX;
      currentRotY = targetRotY;
      try { renderer.domElement.releasePointerCapture(e.pointerId); } catch {}
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // resize handling
    function onResize() {
      const m = mountRef.current;
      if (!m) return;
      const w = m.clientWidth || 600;
      const h = m.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // animation loop
    let frameId: number;
    const clock = new THREE.Clock();
    function animate() {
      clock.getDelta();
      // smoothly interpolate modelGroup rotation towards targets
      modelGroup.rotation.x += (targetRotX - modelGroup.rotation.x) * 0.08;
      modelGroup.rotation.y += (targetRotY - modelGroup.rotation.y) * 0.08;

      // gentle bob of parent group for subtle motion
      group.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.005 - 0.02;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    // cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      // no primitive geometries to dispose; rely on GLTF traversal if model loaded
      // dispose loaded gltf if any
      if (gltfScene) {
        gltfScene.traverse((node) => {
          if ((node as THREE.Mesh).geometry) {
            ((node as THREE.Mesh).geometry as THREE.BufferGeometry).dispose();
          }
          if ((node as THREE.Mesh).material) {
            const mat = (node as THREE.Mesh).material as THREE.Material | THREE.Material[];
            if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat.dispose();
          }
        });
      }
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
