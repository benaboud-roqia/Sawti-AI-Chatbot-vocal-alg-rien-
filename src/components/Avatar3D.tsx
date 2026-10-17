import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarState } from '../types';

interface Avatar3DProps {
  state: AvatarState;
  onAvatarClick?: () => void;
  className?: string;
}

// Module-level reusable math vectors to avoid GC inside render loop
const _targetRotation = new THREE.Euler();
const _mouse = new THREE.Vector2(0, 0);

// Helper for safe rounded rect drawing on canvas across all browsers
function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    try {
      ctx.roundRect(x, y, w, h, r);
      return;
    } catch {}
  }
  ctx.rect(x, y, w, h);
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  state,
  onAvatarClick,
  className = 'w-full h-full min-h-[220px]',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<AvatarState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 320;
    let height = container.clientHeight || 240;
    if (height < 180) height = 240;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.15, 3.4);

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // 3. Lighting Rig (Studio lighting for vibrant Algerian emerald & white aesthetics)
    // Ambient Light to ensure no part is ever completely pitch black
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.4);
    scene.add(ambientLight);

    // Key Light (Warm daylight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    // Fill Light (Cool emerald & teal)
    const fillLight = new THREE.DirectionalLight(0x34d399, 1.8);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // Rim / Backlight for sci-fi silhouette
    const rimLight = new THREE.DirectionalLight(0x10b981, 2.5);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Face Glow Accent Light
    const faceLight = new THREE.PointLight(0x34d399, 1.6, 4);
    faceLight.position.set(0, 0.3, 1.5);
    scene.add(faceLight);

    // 4. Procedural Dynamic Visor Face Texture (Eyes & Animated Voice Wave)
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const faceCtx = faceCanvas.getContext('2d')!;
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    // 5. Build Procedural 3D Avatar (THREE.Group with 10 distinct parts)
    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, -0.05, 0);
    scene.add(avatarGroup);

    // Part 1: Outer Helmet Shell (Algerian Emerald Green)
    const helmetGeo = new THREE.SphereGeometry(0.78, 36, 32);
    helmetGeo.scale(1, 1.1, 0.95);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0x047857, // Vibrant Algerian Emerald Green
      metalness: 0.65,
      roughness: 0.25,
      emissive: 0x022c22,
      emissiveIntensity: 0.3,
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    avatarGroup.add(helmet);

    // Part 2: Inner Visor Screen (Faces +Z directly towards camera)
    // Front half of sphere facing user
    const visorGeo = new THREE.SphereGeometry(0.74, 36, 28, -Math.PI / 2, Math.PI);
    visorGeo.scale(0.92, 0.98, 0.96);
    visorGeo.translate(0, 0.05, 0.08);

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x020617, // Obsidian black glass
      roughness: 0.15,
      metalness: 0.3,
      map: faceTexture,
      emissive: 0x10b981,
      emissiveMap: faceTexture,
      emissiveIntensity: 1.8,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    avatarGroup.add(visor);

    // Part 3: Titanium White Crown Band & Crescent Arch
    const crownGeo = new THREE.TorusGeometry(0.79, 0.05, 16, 48, Math.PI * 0.85);
    crownGeo.rotateX(Math.PI / 2.7);
    crownGeo.translate(0, 0.52, -0.05);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Pure Titanium White
      metalness: 0.85,
      roughness: 0.18,
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    avatarGroup.add(crown);

    // Part 4 & 5: Audio Headphones / Ears (Left & Right Transceivers)
    const earGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 24);
    earGeo.rotateZ(Math.PI / 2);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });

    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.78, 0.05, 0);

    // Glowing Emerald Audio Ring on ear
    const earRingGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 28);
    earRingGeo.rotateY(Math.PI / 2);
    earRingGeo.translate(-0.09, 0, 0);
    const earRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const leftEarRing = new THREE.Mesh(earRingGeo, earRingMat);
    leftEar.add(leftEarRing);
    avatarGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.set(0.78, 0.05, 0);
    avatarGroup.add(rightEar);

    // Part 6 & 7: Dual Audio Antennas (Left & Right)
    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 12);
    antennaGeo.translate(0, 0.22, 0);
    antennaGeo.rotateZ(0.35);
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Warm Algerian Gold
      metalness: 0.9,
      roughness: 0.2,
    });

    const leftAntenna = new THREE.Mesh(antennaGeo, antennaMat);
    leftAntenna.position.set(-0.6, 0.65, -0.1);
    avatarGroup.add(leftAntenna);

    const rightAntennaGeo = antennaGeo.clone();
    rightAntennaGeo.rotateZ(-0.7);
    const rightAntenna = new THREE.Mesh(rightAntennaGeo, antennaMat);
    rightAntenna.position.set(0.6, 0.65, -0.1);
    avatarGroup.add(rightAntenna);

    // Part 8: Articulated Neck Ring
    const neckGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.3, 24);
    neckGeo.translate(0, -0.88, 0);
    const neckMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.4,
    });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    avatarGroup.add(neck);

    // Part 9: Floating Chest & Shoulders with Algerian Crescent & Star Core
    const chestGeo = new THREE.CylinderGeometry(0.5, 0.95, 0.45, 28, 1, true, 0, Math.PI);
    chestGeo.rotateY(Math.PI / 2);
    chestGeo.translate(0, -1.22, 0);
    const chestMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      metalness: 0.75,
      roughness: 0.25,
    });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    avatarGroup.add(chest);

    // Glowing Algerian Emblem Core in center of chest
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    coreGeo.translate(0, -1.12, 0.38);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Algerian Crimson Glow
    const core = new THREE.Mesh(coreGeo, coreMat);
    avatarGroup.add(core);

    // Part 10: Levitating Orbital Sound Rings
    const halo1Geo = new THREE.TorusGeometry(1.15, 0.025, 16, 64);
    halo1Geo.rotateX(Math.PI / 2.3);
    const halo1Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.75,
    });
    const halo1 = new THREE.Mesh(halo1Geo, halo1Mat);
    halo1.position.set(0, -0.1, 0);
    scene.add(halo1);

    const halo2Geo = new THREE.TorusGeometry(1.28, 0.018, 12, 48);
    halo2Geo.rotateX(Math.PI / 1.7);
    const halo2Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Gold
      transparent: true,
      opacity: 0.5,
    });
    const halo2 = new THREE.Mesh(halo2Geo, halo2Mat);
    halo2.position.set(0, -0.1, 0);
    scene.add(halo2);

    // 6. Interactive Mouse / Pointer Tracking
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      _mouse.x = Math.max(-1, Math.min(1, x));
      _mouse.y = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener('pointermove', handlePointerMove);

    // 7. Render & Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    const render = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const curState = stateRef.current;

      // 7a. Dynamic Visor Canvas Drawing
      blinkTimer += delta;
      if (blinkTimer > 3.5) {
        isBlinking = true;
        if (blinkTimer > 3.75) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      faceCtx.clearRect(0, 0, 512, 512);

      // Deep dark sci-fi visor gradient
      const bgGrad = faceCtx.createRadialGradient(256, 256, 40, 256, 256, 260);
      bgGrad.addColorStop(0, '#042f20');
      bgGrad.addColorStop(0.7, '#021810');
      bgGrad.addColorStop(1, '#020617');
      faceCtx.fillStyle = bgGrad;
      faceCtx.fillRect(0, 0, 512, 512);

      // Digital Eyes Colors: Crimson when listening, Cyan when thinking, Bright Emerald normal
      const eyeColor =
        curState === 'listening' ? '#f43f5e' : curState === 'thinking' ? '#38bdf8' : '#34d399';
      faceCtx.fillStyle = eyeColor;
      faceCtx.shadowColor = eyeColor;
      faceCtx.shadowBlur = 18;

      const eyeY = 220;
      const eyeSpacing = 85;
      const eyeWidth = 56;
      const eyeHeight = isBlinking ? 4 : 46;

      // Left Eye
      faceCtx.beginPath();
      safeRoundRect(
        faceCtx,
        256 - eyeSpacing - eyeWidth / 2,
        eyeY - eyeHeight / 2,
        eyeWidth,
        eyeHeight,
        18
      );
      faceCtx.fill();

      // Right Eye
      faceCtx.beginPath();
      safeRoundRect(
        faceCtx,
        256 + eyeSpacing - eyeWidth / 2,
        eyeY - eyeHeight / 2,
        eyeWidth,
        eyeHeight,
        18
      );
      faceCtx.fill();

      // Glowing pupils inside eyes
      if (!isBlinking) {
        faceCtx.fillStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.arc(256 - eyeSpacing + _mouse.x * 6, eyeY + _mouse.y * 6, 9, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.beginPath();
        faceCtx.arc(256 + eyeSpacing + _mouse.x * 6, eyeY + _mouse.y * 6, 9, 0, Math.PI * 2);
        faceCtx.fill();
      }

      // Mouth / Audio Visualizer Expression
      if (curState === 'speaking') {
        // Expressive audio equalizer bars on visor
        const barCount = 11;
        const mouthW = 170;
        const step = mouthW / barCount;
        faceCtx.fillStyle = '#6ee7b7';
        faceCtx.shadowBlur = 14;

        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(elapsed * 14 + i * 0.9) * Math.cos(elapsed * 7 + i * 0.5);
          const barH = Math.max(8, Math.abs(wave) * 54);
          const bx = 256 - mouthW / 2 + i * step;
          const by = 330 - barH / 2;
          faceCtx.beginPath();
          safeRoundRect(faceCtx, bx, by, step - 4, barH, 4);
          faceCtx.fill();
        }
      } else if (curState === 'listening') {
        // Audio Radar Ring pulsing to user voice
        const pulseR = 26 + Math.sin(elapsed * 8) * 10;
        faceCtx.strokeStyle = '#f43f5e';
        faceCtx.lineWidth = 6;
        faceCtx.beginPath();
        faceCtx.arc(256, 330, pulseR, 0, Math.PI * 2);
        faceCtx.stroke();
      } else if (curState === 'thinking') {
        // Rotating thinking spinner arc
        faceCtx.strokeStyle = '#38bdf8';
        faceCtx.lineWidth = 6;
        faceCtx.beginPath();
        faceCtx.arc(256, 330, 22, elapsed * 6, elapsed * 6 + Math.PI * 1.3);
        faceCtx.stroke();
      } else {
        // Friendly gentle smile
        faceCtx.strokeStyle = '#34d399';
        faceCtx.lineWidth = 6;
        faceCtx.beginPath();
        faceCtx.arc(256, 312, 34, 0.2 * Math.PI, 0.8 * Math.PI);
        faceCtx.stroke();
      }

      faceTexture.needsUpdate = true;

      // 7b. Kinematic head rotation & spring damping
      _targetRotation.y = _mouse.x * 0.32;
      _targetRotation.x = -_mouse.y * 0.22;

      if (curState === 'listening') {
        _targetRotation.z = 0.12;
        _targetRotation.x += 0.08;
      } else if (curState === 'speaking') {
        _targetRotation.x += Math.sin(elapsed * 5) * 0.07;
        _targetRotation.z = 0;
      } else {
        _targetRotation.z = 0;
      }

      avatarGroup.rotation.y = THREE.MathUtils.damp(
        avatarGroup.rotation.y,
        _targetRotation.y,
        6,
        delta
      );
      avatarGroup.rotation.x = THREE.MathUtils.damp(
        avatarGroup.rotation.x,
        _targetRotation.x,
        6,
        delta
      );
      avatarGroup.rotation.z = THREE.MathUtils.damp(
        avatarGroup.rotation.z,
        _targetRotation.z,
        6,
        delta
      );

      // Subtle natural breathing bobbing
      avatarGroup.position.y = -0.05 + Math.sin(elapsed * 1.8) * 0.035;

      // Orbiting halos
      halo1.rotation.z = elapsed * 0.4;
      halo1.rotation.y = Math.sin(elapsed * 0.6) * 0.2;
      halo2.rotation.z = -elapsed * 0.5;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 8. Auto-Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 240;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();
      renderer.dispose();
      faceTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      onClick={onAvatarClick}
      title="صوتي 3D — اضغط للتفاعل بالصوت"
      className={`relative cursor-pointer select-none overflow-hidden rounded-2xl flex items-center justify-center transition-all ${className}`}
    />
  );
};
