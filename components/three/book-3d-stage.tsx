'use client';

import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RectAreaLightUniformsLib} from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type {Book} from '@/lib/books-data';
import {renderArchivalPageToCanvas} from '@/lib/pdf/page-canvas-renderer';

export type CameraPreset = 'reading' | 'angled' | 'top' | 'spine';
export type StudioFinish = 'linen' | 'leather' | 'obsidian';

interface Book3DStageProps {
  book: Book;
  /** Current left-hand spread index (1-based page number of left page, e.g. 1, 3, 5) */
  currentPage: number;
  /** Optional custom rendered canvases from PDF.js keyed by pageNumber */
  pdfPageCanvases?: Map<number, HTMLCanvasElement>;
  cameraPreset?: CameraPreset;
  studioFinish?: StudioFinish;
  /** 0 = assembled book, 1 = exploded binding anatomy view */
  explodedFactor?: number;
  /** Triggered when user clicks left or right page in 3D space to turn page */
  onPageTurnRequest?: (direction: 'prev' | 'next') => void;
  className?: string;
}

// Pre-allocated module-scope scratch objects to guarantee Zero GC inside requestAnimationFrame
const _camTargetPos = new THREE.Vector3();
const _camLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.55, 0);
const _dummyMatrix = new THREE.Matrix4();
const _dummyPos = new THREE.Vector3();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3();
const _dummyEuler = new THREE.Euler();
const _dummyColor = new THREE.Color();
const _pointerNdc = new THREE.Vector2();

function createRadialContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(15, 12, 10, 0.65)');
    grad.addColorStop(0.5, 'rgba(15, 12, 10, 0.25)');
    grad.addColorStop(1, 'rgba(15, 12, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createProceduralFabricBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#969696';
    for (let y = 0; y < 128; y += 4) {
      ctx.fillRect(0, y, 128, 1);
    }
    ctx.fillStyle = '#686868';
    for (let x = 0; x < 128; x += 4) {
      ctx.fillRect(x, 0, 1, 128);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 16);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/**
 * Calculates the exact camera distance so the open book spread fills
 * the entire viewport tightly across both width and height.
 */
function computeFitDistance(
  aspect: number,
  fovDeg: number,
  scaleX = 1
): number {
  const targetWidth = 3.84 * scaleX;
  const targetHeight = 2.44;
  const vFovRad = THREE.MathUtils.degToRad(fovDeg);
  const tanHalfVFov = Math.tan(vFovRad / 2);
  const tanHalfHFov = tanHalfVFov * Math.max(0.5, aspect);

  const distForHeight = targetHeight / 2 / tanHalfVFov;
  const distForWidth = targetWidth / 2 / tanHalfHFov;
  return Math.max(distForHeight, distForWidth);
}

export function Book3DStage({
  book,
  currentPage,
  pdfPageCanvases,
  cameraPreset = 'reading',
  studioFinish = 'linen',
  explodedFactor = 0,
  onPageTurnRequest,
  className = 'w-full h-full',
}: Book3DStageProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    book,
    currentPage,
    pdfPageCanvases,
    cameraPreset,
    studioFinish,
    explodedFactor,
    onPageTurnRequest,
    prevPage: currentPage,
    flipAnimProgress: 1,
    flipDirection: 1 as 1 | -1,
    activeCameraTransition: true,
  });

  useEffect(() => {
    const prev = stateRef.current;
    if (prev.currentPage !== currentPage) {
      prev.flipDirection = currentPage > prev.currentPage ? 1 : -1;
      prev.flipAnimProgress = 0;
      prev.prevPage = prev.currentPage;
      prev.currentPage = currentPage;
    }
    if (prev.cameraPreset !== cameraPreset) {
      prev.cameraPreset = cameraPreset;
      prev.activeCameraTransition = true;
    }
    prev.book = book;
    prev.pdfPageCanvases = pdfPageCanvases;
    prev.studioFinish = studioFinish;
    prev.explodedFactor = explodedFactor;
    prev.onPageTurnRequest = onPageTurnRequest;
  }, [
    book,
    currentPage,
    pdfPageCanvases,
    cameraPreset,
    studioFinish,
    explodedFactor,
    onPageTurnRequest,
  ]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string (never user-agent)
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Calibrated exposure so white paper pages never blow out text contrast
    renderer.toneMappingExposure = 0.88;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color('#141210');
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2('#141210', 0.035);

    // 2. Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Camera & OrbitControls calibrated to fit the full screen
    const fov = 34;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
    const initialDist = computeFitDistance(width / height, fov);
    camera.position.set(0, 0.65 + initialDist, 0.08);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 1.4;
    controls.maxDistance = 9.5;
    controls.target.set(0, 0.62, 0);

    const cancelScriptedCamera = () => {
      stateRef.current.activeCameraTransition = false;
    };
    controls.addEventListener('start', cancelScriptedCamera);

    // 4. Balanced 3-Point Studio Lighting Rig (no glare on reading pages)
    const hemiLight = new THREE.HemisphereLight('#E2E8F0', '#292524', 0.55);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF7ED', 1.25);
    keyLight.position.set(3.2, 6.2, 3.6);
    keyLight.castShadow = !isSoftwareGl;
    const d = 3.8;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#93C5FD', 0.65);
    rimLight.position.set(-4.0, 4.5, -3.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight('#FFFBEB', 1.4, 4.5, 2.8);
      softbox.position.set(0, 5.5, 2.5);
      softbox.lookAt(0, 0.5, 0);
      scene.add(softbox);
    }

    // 5. Studio Table Floor + Contact Shadow Grounding
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#141210',
      roughness: 0.85,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const shadowTex = createRadialContactShadowTexture();
    const contactShadowGeo = new THREE.PlaneGeometry(5.8, 4.2);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const contactShadowMesh = new THREE.Mesh(
      contactShadowGeo,
      contactShadowMat
    );
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.y = 0.02;
    scene.add(contactShadowMesh);

    // 6. Composite 10-Part Procedural Book & Lectern Assembly (THREE.Group)
    const rootAssembly = new THREE.Group();
    rootAssembly.position.set(0, 0, 0);
    scene.add(rootAssembly);

    const fabricBump = createProceduralFabricBumpTexture();

    // Part 1: Turned Brass & Walnut Pedestal Stand (LatheGeometry)
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.85, 0.0),
      new THREE.Vector2(0.82, 0.06),
      new THREE.Vector2(0.32, 0.14),
      new THREE.Vector2(0.24, 0.34),
      new THREE.Vector2(0.55, 0.42),
      new THREE.Vector2(0.0, 0.42),
    ];
    const pedestalGeo = new THREE.LatheGeometry(lathePoints, 32);
    pedestalGeo.computeTangents();
    const brassMat = new THREE.MeshPhysicalMaterial({
      color: '#D4AF37',
      metalness: 0.92,
      roughness: 0.18,
      anisotropy: 0.8,
      clearcoat: 0.4,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, brassMat);
    pedestalMesh.castShadow = true;
    pedestalMesh.receiveShadow = true;
    rootAssembly.add(pedestalMesh);

    // Part 2: Recessed Support Cradle tucked strictly beneath the page footprint
    const pageW = 1.88;
    const pageH = 2.42;
    const boardW = pageW - 0.04;
    const boardH = pageH - 0.04;

    const cradleShape = new THREE.Shape();
    cradleShape.moveTo(-boardW, -boardH / 2);
    cradleShape.lineTo(boardW, -boardH / 2);
    cradleShape.lineTo(boardW, boardH / 2);
    cradleShape.lineTo(-boardW, boardH / 2);
    cradleShape.closePath();

    const cradleGeo = new THREE.ExtrudeGeometry(cradleShape, {
      depth: 0.03,
      bevelEnabled: false,
    });
    const walnutMat = new THREE.MeshStandardMaterial({
      color: '#181614',
      roughness: 0.75,
      metalness: 0.05,
    });
    const cradleMesh = new THREE.Mesh(cradleGeo, walnutMat);
    cradleMesh.rotation.x = -Math.PI / 2;
    cradleMesh.position.set(0, 0.44, 0);
    cradleMesh.castShadow = true;
    cradleMesh.receiveShadow = true;
    rootAssembly.add(cradleMesh);

    // Book Group sitting flush and flat so top-down reading fills the screen cleanly
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 0.5, 0);
    bookGroup.rotation.x = 0.02;
    rootAssembly.add(bookGroup);

    const coverMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1C1917'),
      roughness: 0.78,
      metalness: 0.05,
      bumpMap: fabricBump,
      bumpScale: 0.004,
    });

    const pageEdgeMat = new THREE.MeshStandardMaterial({
      color: '#EAE4D7',
      roughness: 0.85,
      metalness: 0.02,
    });

    // Part 3 & 4: Left and Right Hardcover Boards (tight editorial overhang)
    const boardShape = new THREE.Shape();
    boardShape.moveTo(0, -boardH / 2);
    boardShape.lineTo(boardW, -boardH / 2);
    boardShape.lineTo(boardW, boardH / 2);
    boardShape.lineTo(0, boardH / 2);
    boardShape.closePath();

    const boardGeo = new THREE.ExtrudeGeometry(boardShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
    });

    const leftBoard = new THREE.Mesh(boardGeo, coverMat);
    leftBoard.rotation.x = -Math.PI / 2;
    leftBoard.rotation.z = Math.PI;
    leftBoard.position.set(-0.03, 0, 0);
    leftBoard.castShadow = true;
    leftBoard.receiveShadow = true;
    bookGroup.add(leftBoard);

    const rightBoard = new THREE.Mesh(boardGeo, coverMat);
    rightBoard.rotation.x = -Math.PI / 2;
    rightBoard.position.set(0.03, 0.035, 0);
    rightBoard.castShadow = true;
    rightBoard.receiveShadow = true;
    bookGroup.add(rightBoard);

    // Part 5: Rounded Spine Hub + 5 Raised Gilded Binding Ribs
    const spineGroup = new THREE.Group();
    const spineShellGeo = new THREE.CylinderGeometry(
      0.08,
      0.08,
      boardH + 0.01,
      24,
      1,
      false,
      0,
      Math.PI
    );
    const spineShell = new THREE.Mesh(spineShellGeo, coverMat);
    spineShell.rotation.x = Math.PI / 2;
    spineShell.rotation.y = -Math.PI / 2;
    spineGroup.add(spineShell);

    const ribGeo = new THREE.TorusGeometry(0.084, 0.009, 12, 24, Math.PI);
    for (let r = -2; r <= 2; r++) {
      const rib = new THREE.Mesh(ribGeo, brassMat);
      rib.position.set(0, -0.01, r * 0.44);
      rib.rotation.x = Math.PI;
      spineGroup.add(rib);
    }
    bookGroup.add(spineGroup);

    // Part 6: Recessed Corner Supports (tucked beneath pages so no border protrudes)
    const claspGeo = new THREE.BoxGeometry(0.06, 0.03, 0.06);
    const claspsGroup = new THREE.Group();
    const claspOffsets = [
      [-boardW + 0.04, 0.01, -boardH / 2 + 0.04],
      [-boardW + 0.04, 0.01, boardH / 2 - 0.04],
      [boardW - 0.04, 0.01, -boardH / 2 + 0.04],
      [boardW - 0.04, 0.01, boardH / 2 - 0.04],
    ];
    for (const [cx, cy, cz] of claspOffsets) {
      const clasp = new THREE.Mesh(claspGeo, coverMat);
      clasp.position.set(cx, cy, cz);
      claspsGroup.add(clasp);
    }
    bookGroup.add(claspsGroup);

    // Part 7: Left & Right Curved Page Stacks + Active Top Spread Pages
    const pageBlockGeo = new THREE.BoxGeometry(pageW, 0.075, pageH, 24, 1, 1);
    const blockPos = pageBlockGeo.attributes.position;
    for (let i = 0; i < blockPos.count; i++) {
      const lx = blockPos.getX(i);
      const normalized = (lx + pageW / 2) / pageW;
      const arch = Math.sin(normalized * Math.PI) * 0.04;
      blockPos.setY(i, blockPos.getY(i) + arch);
    }
    pageBlockGeo.computeVertexNormals();

    const leftPageBlock = new THREE.Mesh(pageBlockGeo, pageEdgeMat);
    leftPageBlock.position.set(-pageW / 2 - 0.015, 0.06, 0);
    leftPageBlock.castShadow = true;
    leftPageBlock.receiveShadow = true;
    bookGroup.add(leftPageBlock);

    const rightPageBlock = new THREE.Mesh(pageBlockGeo, pageEdgeMat);
    rightPageBlock.position.set(pageW / 2 + 0.015, 0.06, 0);
    rightPageBlock.castShadow = true;
    rightPageBlock.receiveShadow = true;
    bookGroup.add(rightPageBlock);

    const createCurvedSheetGeo = () => {
      const geo = new THREE.PlaneGeometry(pageW, pageH, 32, 16);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i);
        const norm = (px + pageW / 2) / pageW;
        const arch = Math.sin(norm * Math.PI) * 0.04;
        pos.setY(i, arch);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const leftSurfaceGeo = createCurvedSheetGeo();
    const rightSurfaceGeo = createCurvedSheetGeo();

    const leftTex = new THREE.CanvasTexture(
      renderArchivalPageToCanvas(
        stateRef.current.book,
        stateRef.current.book.pages[0],
        1
      )
    );
    leftTex.colorSpace = THREE.SRGBColorSpace;
    leftTex.anisotropy = maxAnisotropy;

    const rightTex = new THREE.CanvasTexture(
      renderArchivalPageToCanvas(
        stateRef.current.book,
        stateRef.current.book.pages[1],
        2
      )
    );
    rightTex.colorSpace = THREE.SRGBColorSpace;
    rightTex.anisotropy = maxAnisotropy;

    // Matte archival paper material (roughness: 0.96, metalness: 0, envMapIntensity: 0.15)
    // so overhead lights never wash out the black typography!
    const leftPageMat = new THREE.MeshStandardMaterial({
      map: leftTex,
      roughness: 0.96,
      metalness: 0.0,
      envMapIntensity: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const rightPageMat = new THREE.MeshStandardMaterial({
      map: rightTex,
      roughness: 0.96,
      metalness: 0.0,
      envMapIntensity: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const leftSpreadMesh = new THREE.Mesh(leftSurfaceGeo, leftPageMat);
    leftSpreadMesh.position.set(-pageW / 2 - 0.015, 0.102, 0);
    leftSpreadMesh.receiveShadow = true;
    leftSpreadMesh.layers.enable(1);
    leftSpreadMesh.userData = {side: 'left'};
    bookGroup.add(leftSpreadMesh);

    const rightSpreadMesh = new THREE.Mesh(rightSurfaceGeo, rightPageMat);
    rightSpreadMesh.position.set(pageW / 2 + 0.015, 0.102, 0);
    rightSpreadMesh.receiveShadow = true;
    rightSpreadMesh.layers.enable(1);
    rightSpreadMesh.userData = {side: 'right'};
    bookGroup.add(rightSpreadMesh);

    // Part 8: Actively Flipping Page Leaf (pivoted at spine x=0)
    const flippingGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 16);
    flippingGeo.rotateX(-Math.PI / 2);
    flippingGeo.translate(pageW / 2, 0, 0);
    const flipBasePositions = Float32Array.from(
      flippingGeo.attributes.position.array
    );

    const flipMat = new THREE.MeshStandardMaterial({
      map: rightTex,
      roughness: 0.95,
      metalness: 0.0,
      envMapIntensity: 0.15,
      side: THREE.DoubleSide,
    });
    const flippingLeafMesh = new THREE.Mesh(flippingGeo, flipMat);
    flippingLeafMesh.position.set(0, 0.108, 0);
    flippingLeafMesh.castShadow = true;
    flippingLeafMesh.visible = false;
    bookGroup.add(flippingLeafMesh);

    // Part 9: Discreet Spine Tail tucked beneath the page block
    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, boardH / 2 - 0.2),
      new THREE.Vector3(0.005, 0.04, boardH / 2 - 0.1),
      new THREE.Vector3(0.01, 0.02, boardH / 2 - 0.05),
      new THREE.Vector3(0.015, 0.01, boardH / 2 - 0.02),
    ]);
    const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 16, 0.006, 8, false);
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: '#1C1917',
      roughness: 0.7,
      metalness: 0.05,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    bookGroup.add(ribbonMesh);

    // Part 10: InstancedMesh (>20 perimeter brass archival inlays placed outside the book footprint)
    const instanceCount = 28;
    const studGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.008, 12);
    const studMat = new THREE.MeshStandardMaterial({
      color: '#D4AF37',
      metalness: 0.85,
      roughness: 0.28,
    });
    const instancedStuds = new THREE.InstancedMesh(
      studGeo,
      studMat,
      instanceCount
    );
    for (let i = 0; i < instanceCount; i++) {
      const angle = (i / instanceCount) * Math.PI * 2;
      const radiusX = 3.2;
      const radiusZ = 2.2;
      _dummyPos.set(
        Math.cos(angle) * radiusX,
        0.01,
        Math.sin(angle) * radiusZ
      );
      _dummyEuler.set(0, angle, 0);
      _dummyQuat.setFromEuler(_dummyEuler);
      const scaleVar = 0.85 + ((i * 13) % 30) / 100;
      _dummyScale.setScalar(scaleVar);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      instancedStuds.setMatrixAt(i, _dummyMatrix);

      _dummyColor.setHSL(0.11 + (i % 4) * 0.01, 0.6, 0.48);
      instancedStuds.setColorAt(i, _dummyColor);
    }
    instancedStuds.instanceMatrix.needsUpdate = true;
    if (instancedStuds.instanceColor) {
      instancedStuds.instanceColor.needsUpdate = true;
    }
    instancedStuds.computeBoundingSphere();
    rootAssembly.add(instancedStuds);

    // Always normalize spread index to an odd left-page number (1, 3, 5, 7)
    // so left & right pages never show the same page number!
    let lastRenderedBookId = '';
    let lastRenderedLeftPage = -1;
    let lastPdfCanvasCount = -1;

    function syncSpreadTextures() {
      const {book: curBook, currentPage: rawPage, pdfPageCanvases: pdfMap} =
        stateRef.current;
      const pdfCount = pdfMap ? pdfMap.size : 0;

      // Ensure odd left page index (1, 3, 5, ...) and valid right page index (2, 4, 6, ...)
      const maxOddLeft =
        curBook.page_count % 2 === 0
          ? Math.max(1, curBook.page_count - 1)
          : curBook.page_count;
      const normalizedLeft = Math.min(
        maxOddLeft,
        rawPage % 2 === 0 ? Math.max(1, rawPage - 1) : Math.max(1, rawPage)
      );
      const rightPageIndex = normalizedLeft + 1;

      if (
        curBook.id === lastRenderedBookId &&
        normalizedLeft === lastRenderedLeftPage &&
        pdfCount === lastPdfCanvasCount
      ) {
        return;
      }
      lastRenderedBookId = curBook.id;
      lastRenderedLeftPage = normalizedLeft;
      lastPdfCanvasCount = pdfCount;

      const leftCanvas =
        pdfMap?.get(normalizedLeft) ||
        renderArchivalPageToCanvas(
          curBook,
          curBook.pages[normalizedLeft - 1],
          normalizedLeft
        );
      const rightCanvas =
        rightPageIndex <= curBook.page_count
          ? pdfMap?.get(rightPageIndex) ||
            renderArchivalPageToCanvas(
              curBook,
              curBook.pages[rightPageIndex - 1],
              rightPageIndex
            )
          : renderArchivalPageToCanvas(curBook, undefined, rightPageIndex);

      const nextLeftTex = new THREE.CanvasTexture(leftCanvas);
      nextLeftTex.colorSpace = THREE.SRGBColorSpace;
      nextLeftTex.anisotropy = maxAnisotropy;

      const nextRightTex = new THREE.CanvasTexture(rightCanvas);
      nextRightTex.colorSpace = THREE.SRGBColorSpace;
      nextRightTex.anisotropy = maxAnisotropy;

      leftPageMat.map?.dispose();
      rightPageMat.map?.dispose();

      leftPageMat.map = nextLeftTex;
      leftPageMat.needsUpdate = true;

      rightPageMat.map = nextRightTex;
      rightPageMat.needsUpdate = true;

      flipMat.map = nextRightTex;
      flipMat.needsUpdate = true;
    }

    syncSpreadTextures();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting on Layer 1 for clicking left/right pages to flip
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    let pointerDownX = 0;
    let pointerDownY = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = Math.abs(e.clientX - pointerDownX);
      const dy = Math.abs(e.clientY - pointerDownY);
      if (dx > 6 || dy > 6) return;
      if (!stateRef.current.onPageTurnRequest) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const domW = renderer.domElement.clientWidth || rect.width || 1;
      const domH = renderer.domElement.clientHeight || rect.height || 1;
      const localX =
        typeof e.offsetX === 'number' ? e.offsetX : e.clientX - rect.left;
      const localY =
        typeof e.offsetY === 'number' ? e.offsetY : e.clientY - rect.top;
      _pointerNdc.x = (localX / domW) * 2 - 1;
      _pointerNdc.y = -(localY / domH) * 2 + 1;

      raycaster.setFromCamera(_pointerNdc, camera);
      const hits = raycaster.intersectObjects(
        [leftSpreadMesh, rightSpreadMesh],
        false
      );
      if (hits.length > 0) {
        const side = hits[0].object.userData.side;
        if (side === 'right') {
          stateRef.current.onPageTurnRequest('next');
        } else if (side === 'left') {
          stateRef.current.onPageTurnRequest('prev');
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      stateRef.current.activeCameraTransition = true;
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => handleResize())
        : null;
    resizeObserver?.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let currentExploded = 0;

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);

      syncSpreadTextures();

      const {studioFinish: finish} = stateRef.current;
      if (finish === 'linen') {
        coverMat.color.set('#1C1917');
        coverMat.roughness = 0.78;
        coverMat.metalness = 0.05;
      } else if (finish === 'leather') {
        coverMat.color.set('#1F1B18');
        coverMat.roughness = 0.48;
        coverMat.metalness = 0.08;
      } else {
        coverMat.color.set('#18181B');
        coverMat.roughness = 0.25;
        coverMat.metalness = 0.4;
      }

      // Smoothly damp Exploded View anatomy separation
      currentExploded = THREE.MathUtils.damp(
        currentExploded,
        stateRef.current.explodedFactor,
        6,
        dt
      );
      pedestalMesh.position.y = -currentExploded * 0.45;
      cradleMesh.position.y = 0.44 - currentExploded * 0.2;
      leftBoard.position.y = -currentExploded * 0.18;
      rightBoard.position.y = 0.035 - currentExploded * 0.18;
      spineGroup.position.y = -currentExploded * 0.32;
      leftPageBlock.position.y = 0.06 + currentExploded * 0.16;
      rightPageBlock.position.y = 0.06 + currentExploded * 0.16;
      leftSpreadMesh.position.y = 0.102 + currentExploded * 0.34;
      rightSpreadMesh.position.y = 0.102 + currentExploded * 0.34;
      ribbonMesh.position.y = currentExploded * 0.45;

      // Animate 3D Page Flip
      if (stateRef.current.flipAnimProgress < 0.999) {
        stateRef.current.flipAnimProgress = THREE.MathUtils.damp(
          stateRef.current.flipAnimProgress,
          1,
          7.5,
          dt
        );
        const t = stateRef.current.flipAnimProgress;
        const dir = stateRef.current.flipDirection;
        flippingLeafMesh.visible = true;
        const angle = dir === 1 ? t * Math.PI : (1 - t) * Math.PI;
        const posAttr = flippingGeo.attributes.position;
        const curlStrength = Math.sin(t * Math.PI) * 0.26;

        for (let i = 0; i < posAttr.count; i++) {
          const baseX = flipBasePositions[i * 3];
          const baseZ = flipBasePositions[i * 3 + 2];
          const radialNorm = baseX / pageW;
          const localAngle =
            angle - Math.sin(radialNorm * Math.PI) * curlStrength * dir;
          const rx = Math.cos(localAngle) * baseX;
          const ry =
            Math.sin(localAngle) * baseX +
            Math.sin(radialNorm * Math.PI) * 0.04;
          posAttr.setXYZ(i, rx, ry, baseZ);
        }
        posAttr.needsUpdate = true;
        flippingGeo.computeVertexNormals();
        flippingLeafMesh.position.y = 0.108 + currentExploded * 0.36;
      } else {
        flippingLeafMesh.visible = false;
      }

      // Adapt book spread horizontal proportion on widescreen & mobile landscape viewports so the book fills the whole screen
      const nativeBookAspect = 3.84 / 2.44;
      const desiredScaleX =
        camera.aspect > nativeBookAspect
          ? Math.min(1.65, camera.aspect / nativeBookAspect)
          : 1.0;
      rootAssembly.scale.x = THREE.MathUtils.damp(
        rootAssembly.scale.x,
        desiredScaleX,
        8,
        dt
      );

      // Responsive Full-Screen Camera Framing
      if (stateRef.current.activeCameraTransition) {
        const preset = stateRef.current.cameraPreset;
        const fitDist = computeFitDistance(
          camera.aspect,
          camera.fov,
          desiredScaleX
        );

        if (preset === 'reading' || preset === 'top') {
          // Fit the open book spread edge-to-edge across the entire screen
          _camTargetPos.set(
            0,
            0.58 + fitDist * 0.94,
            preset === 'top' ? 0.01 : 0.03
          );
          _camLookAt.set(0, 0.58, 0);
        } else if (preset === 'angled') {
          _camTargetPos.set(
            fitDist * 0.34,
            0.58 + fitDist * 0.78,
            fitDist * 0.56
          );
          _camLookAt.set(0, 0.55, 0);
        } else {
          // spine close-up
          _camTargetPos.set(0, 0.58 + fitDist * 0.42, fitDist * 0.72);
          _camLookAt.set(0, 0.55, 0);
        }

        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          _camTargetPos.x,
          6,
          dt
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          _camTargetPos.y,
          6,
          dt
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          _camTargetPos.z,
          6,
          dt
        );

        _currentLookAt.x = THREE.MathUtils.damp(
          _currentLookAt.x,
          _camLookAt.x,
          6,
          dt
        );
        _currentLookAt.y = THREE.MathUtils.damp(
          _currentLookAt.y,
          _camLookAt.y,
          6,
          dt
        );
        _currentLookAt.z = THREE.MathUtils.damp(
          _currentLookAt.z,
          _camLookAt.z,
          6,
          dt
        );
        controls.target.copy(_currentLookAt);

        if (camera.position.distanceToSquared(_camTargetPos) < 0.0004) {
          stateRef.current.activeCameraTransition = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      envTexture.dispose();
      shadowTex.dispose();
      fabricBump.dispose();
      leftPageMat.map?.dispose();
      rightPageMat.map?.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={canvasMountRef} className={className} />;
}
