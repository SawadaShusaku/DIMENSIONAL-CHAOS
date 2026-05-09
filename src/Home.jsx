import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Stars, Sparkles, Clone, ScrollControls, Scroll, useScroll, useAnimations, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

// 各モデルの基準スケールを管理する辞書
const MODEL_CONFIG = {
  'Fox.glb': 0.02,
  'Avocado.glb': 20,
  'Duck.glb': 1,
  'DamagedHelmet.glb': 1.5,
  'Floating_Island_01_Art.glb': 0.5,
  'Floating_Island_02_Art.glb': 0.5,
  'Floating_Island_3_Art.glb': 0.5,
  'Floating_Island_4_Art.glb': 0.5,
  'Butterfly.glb': 5,
  'DeerArmature.glb': 0.02,
};

// 群れに使用するモデルの全リスト（public/modelsの中身を網羅）
const STAMPEDE_MODELS = [
  { url: '/models/Avocado.glb', baseScale: 20 },
  { url: '/models/Bench_01_Art.glb', baseScale: 1 },
  { url: '/models/Brick_Step_01_Art.glb', baseScale: 1 },
  { url: '/models/Bush_01_Art.glb', baseScale: 1 },
  { url: '/models/Bush_02_Art.glb', baseScale: 1 },
  { url: '/models/Bush_03_art.glb', baseScale: 1 },
  { url: '/models/Butterfly.glb', baseScale: 5 },
  { url: '/models/DamagedHelmet.glb', baseScale: 1.5 },
  { url: '/models/DeerArmature.glb', baseScale: 0.02 },
  { url: '/models/Duck.glb', baseScale: 1 },
  { url: '/models/Fence_01_Art.glb', baseScale: 1 },
  { url: '/models/Fence_01_Post_Art.glb', baseScale: 1 },
  { url: '/models/Floating_Island_01_Art.glb', baseScale: 0.5 },
  { url: '/models/Floating_Island_02_Art.glb', baseScale: 0.5 },
  { url: '/models/Floating_Island_3_Art.glb', baseScale: 0.5 },
  { url: '/models/Floating_Island_4_Art.glb', baseScale: 0.5 },
  { url: '/models/Flower_01_a.glb', baseScale: 1 },
  { url: '/models/Flower_01_b.glb', baseScale: 1 },
  { url: '/models/Fox.glb', baseScale: 0.02 }
];

// 1. Preload ALL models for the scene
STAMPEDE_MODELS.forEach(m => useGLTF.preload(m.url));

// Pre-define static positions to avoid array recreation on render
const DUCK_POS = [-40, 0, 0];
const HELMET_POS = [0, 40, 0];
const AVOCADO_POS = [40, -5, 0];

function AnimatedFox({ animName, position, scale, rotation, timeOffset = 0, autoPlay = false, onClick, onPointerOver, onPointerOut }) {
  const { scene, animations } = useGLTF('/models/Fox.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  const scroll = useScroll();

  useEffect(() => {
    const action = actions[animName] || actions['Run'] || Object.values(actions)[0];
    if (action) {
      action.play();
      action.paused = !autoPlay; // autoPlayがtrueなら自動再生を止めない
    }
  }, [actions, animName, autoPlay]);

  useFrame(() => {
    const action = actions[animName] || actions['Run'] || Object.values(actions)[0];
    if (action && !autoPlay) {
      const duration = action.getClip().duration;
      // スクロール量に比例してアニメーション時間を進める（スクロールをやめると止まる）
      action.time = (scroll.offset * 20 * duration + timeOffset) % duration;
    }
  });

  return (
    <group ref={group} position={position} scale={scale} rotation={rotation} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      <primitive object={clone} />
    </group>
  );
}

function FoxStampede() {
  const scroll = useScroll();
  const groupRef = useRef();

  const foxes = useMemo(() => {
    const arr = [];
    // 20パターンの「列」を作成し、それぞれY軸の5段に配置する（計100匹）
    for (let i = 0; i < 20; i++) {
      // 最初の時(40)より少しだけ広くする(60)
      const baseX = (Math.random() - 0.5) * 60;
      const baseZ = (Math.random() - 0.5) * 20;
      const baseScale = 0.05 + Math.random() * 0.03;
      const baseTimeOffset = Math.random() * 10;

      // 5列（5段）にし、隙間を狭くして「一群」感を強調
      const yLevels = [8, 4, 0, -4, -8];

      yLevels.forEach((y) => {
        const isRun = Math.random() < 0.8;
        arr.push({
          animName: isRun ? 'Run' : 'Walk',
          position: [baseX, y, baseZ],
          scale: baseScale, // 同じ縦列はスケールを揃える
          rotation: [0, -Math.PI / 2, 0],
          // 列内で完全に同期させたい場合は baseTimeOffset。少しずらすなら + Math.random()
          timeOffset: baseTimeOffset + Math.random() * 2
        });
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const foxT = scroll.range(0.7, 0.2);

    // Z=-10 での正確な画面幅を取得
    const v = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, -10));
    // 群れの横幅（約60）の半分＋マージンを足して、完全に画面外となるX座標を計算
    const offX = (v.width / 2) + 50;

    // 画面外から画面外へ
    groupRef.current.position.x = THREE.MathUtils.lerp(offX, -offX, foxT);

    // ドリーズーム時に端が見えないように ＆ パフォーマンス向上のため、出番以外は非表示
    groupRef.current.visible = scroll.offset > 0.6 && scroll.offset < 0.95;
  });

  return (
    // 全体の基準位置を少し調整（y=-5で画面中央にY=0の列が来るように）
    <group ref={groupRef} position={[0, -5, -10]}>
      {foxes.map((fox, i) => (
        <AnimatedFox key={i} {...fox} />
      ))}
    </group>
  );
}

function BackToTopFox() {
  const scroll = useScroll();
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // 一番最後の最後（0.9以上）でのみ表示する
      const isEnd = scroll.offset > 0.9;
      groupRef.current.visible = isEnd;

      if (isEnd) {
        // 現在のカメラのFOVと画面サイズに基づき、Z=15（カメラの手前15）での画面の幅と高さを取得
        // ※groupRef.current.positionを渡すとX,Yが加味されて無限ループで巨大化するため、必ず[0,0,15]を渡す
        const targetZ = new THREE.Vector3(0, 0, 15);
        const v = state.viewport.getCurrentViewport(state.camera, targetZ);

        // Webサイトのよくある「トップに戻る」ボタンの位置（右下）に固定する
        // v.width / 2 が画面右端、v.height / 2 が画面下端
        const paddingX = v.width * 0.08;
        const paddingY = v.height * 0.1;

        groupRef.current.position.x = (v.width / 2) - paddingX;
        groupRef.current.position.y = (-v.height / 2) + paddingY;

        // ボタンらしく控えめにフワフワさせる
        groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.2;
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    scroll.el.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.cursor = 'auto';
  };

  return (
    // Z位置のみ15（カメラの少し前）に固定し、XとYはuseFrameで毎フレーム右下に追従させる
    <group ref={groupRef} position={[0, 0, 15]}>
      <Text position={[0, 2.5, 0]} fontSize={0.8} color="#00ffff" anchorX="center" anchorY="bottom" outlineWidth={0.04} outlineColor="#000000">
        TOP
      </Text>
      <AnimatedFox
        animName="Survey"
        scale={0.035} // 程よいボタンサイズ
        // 変に傾けず、真っ直ぐ立たせる
        rotation={[0, -Math.PI / 6, 0]}
        autoPlay={true}
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      />
    </group>
  );
}

function MasterScene() {
  const swarmGroupRef = useRef();
  const duckRef = useRef();
  const helmetRef = useRef();
  const avocadoRef = useRef();
  const warpGroupRef = useRef();
  const titleGroupRef = useRef();
  const titleMatRef = useRef();
  const subtitleMatRef = useRef();

  const scroll = useScroll();

  // 2. Load multiple GLTFs at once using an array (fixes Rule of Hooks violation)
  // 以前の LOCAL_MODELS を STAMPEDE_MODELS に差し替え
  const gltfs = useGLTF(STAMPEDE_MODELS.map(m => m.url), true);

  const duckGLTF = useGLTF('/models/Duck.glb');
  const helmetGLTF = useGLTF('/models/DamagedHelmet.glb');
  const avocadoGLTF = useGLTF('/models/Avocado.glb');
  const islandGLTF = useGLTF('/models/Floating_Island_4_Art.glb');

  // Generate the Chaos Swarm
  const items = useMemo(() => {
    const arr = [];
    if (STAMPEDE_MODELS.length === 0) return arr;
    // 背景の密度を倍増（150 -> 300）
    for (let i = 0; i < 300; i++) {
      const modelIndex = Math.floor(Math.random() * STAMPEDE_MODELS.length);

      const model = STAMPEDE_MODELS[modelIndex];
      const angle = Math.random() * Math.PI * 2;
      // 半径を調整
      const radius = 15 + Math.random() * 60;
      // Z軸（奥行き）をより深く（-80 ~ -580）設定して、空間の広がりを出す
      const z = -80 - Math.random() * 500;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // モデル固有の基準スケールを掛けて、大きさを正規化する
      const scaleMultiplier = (1.0 + Math.random() * 2.0) * model.baseScale;

      arr.push({
        modelIndex,
        position: [x, y, z],
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        scale: scaleMultiplier,
        speed: 0.1 + Math.random() * 0.2
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    // Background Swarm
    if (swarmGroupRef.current) {
      const warpT = scroll.range(0.85, 0.15);
      // Ease-Out（減速）の計算式：最初は速く、終盤にいくほどゆっくりになる
      const easeOutT = 1 - Math.pow(1 - warpT, 2);

      // ワープ時には少し回転を早めて「渦」を表現
      swarmGroupRef.current.rotation.z = state.clock.getElapsedTime() * 0.02 + THREE.MathUtils.lerp(0, Math.PI * 2, warpT);
      swarmGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;

      // 伸びる演出（スパゲッティ化）をやめ、等倍のままにする
      swarmGroupRef.current.scale.setScalar(1);

      // 猛スピードで全モデルがカメラ（z=30）を突き抜け、完全に背後（z>100）まで飛んでいく大移動
      // ユーザーが一気にスクロールすることを考慮し、終盤にゆっくりになるEase-Outを適用
      swarmGroupRef.current.position.z = THREE.MathUtils.lerp(0, 400, easeOutT);

      swarmGroupRef.current.children.forEach((child, i) => {
        child.rotation.x += items[i].speed * 0.01;
        child.rotation.y += items[i].speed * 0.01;
      });
    }

    // viewportのZ=0での正確な幅と高さを取得（ウルトラワイド対策）
    const v0 = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, 0));
    const offX = (v0.width / 2) + 20; // 画面端 + モデルの大きさ分のマージン
    const offY = (v0.height / 2) + 20;

    // Duck Section: Enters 0.1~0.2, Centers 0.2~0.3, Exits 0.3~0.4 (Right)
    if (duckRef.current) {
      duckRef.current.visible = scroll.offset < 0.45;
      const duckIn = scroll.range(0.1, 0.1);
      const duckOut = scroll.range(0.3, 0.1);
      // ウルトラワイドでも確実に画面外から現れ、画面外へ消える
      duckRef.current.position.x = THREE.MathUtils.lerp(-offX, 0, duckIn) + THREE.MathUtils.lerp(0, offX, duckOut);
      duckRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, duckIn) + THREE.MathUtils.lerp(0, Math.PI * 2, duckOut);

      if (duckIn > 0.9 && duckOut < 0.1) {
        duckRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
      } else {
        duckRef.current.position.y = 0;
      }
    }

    // Helmet Section: Enters 0.3~0.4 (Top), Centers 0.4~0.5, Exits 0.5~0.6 (Bottom)
    if (helmetRef.current) {
      helmetRef.current.visible = scroll.offset > 0.25 && scroll.offset < 0.65;
      const helmetIn = scroll.range(0.3, 0.1);
      const helmetOut = scroll.range(0.5, 0.1);
      // 上下も動的に計算
      helmetRef.current.position.y = THREE.MathUtils.lerp(offY, 0, helmetIn) + THREE.MathUtils.lerp(0, -offY, helmetOut);
      // 逆さまにならないようにY軸のみで回転
      helmetRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, helmetIn) + THREE.MathUtils.lerp(0, Math.PI * 2, helmetOut);
      helmetRef.current.rotation.z = 0;
      helmetRef.current.rotation.x = 0;
    }

    // Avocado Section: Enters 0.5~0.6 (Right), Centers 0.6~0.7, Exits 0.7~0.8 (Left)
    if (avocadoRef.current) {
      avocadoRef.current.visible = scroll.offset > 0.45 && scroll.offset < 0.85;
      const avocadoIn = scroll.range(0.5, 0.1);
      const avocadoOut = scroll.range(0.7, 0.1);
      avocadoRef.current.position.x = THREE.MathUtils.lerp(offX, 0, avocadoIn) + THREE.MathUtils.lerp(0, -offX, avocadoOut);
      avocadoRef.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 2, avocadoIn) + THREE.MathUtils.lerp(0, -Math.PI * 2, avocadoOut);

      if (avocadoIn > 0.9 && avocadoOut < 0.1) {
        avocadoRef.current.position.y = -5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
      } else {
        avocadoRef.current.position.y = -5;
      }
    }

    // Warp Island Section: Appears 0.85~1.0
    if (warpGroupRef.current) {
      const warpT = scroll.range(0.85, 0.15);
      // Ease-Out（減速）の計算式
      const easeOutT = 1 - Math.pow(1 - warpT, 2);

      // 一つだけ残らず、他のモデルと同じようにカメラ（z=30）を完全に通り過ぎて背後へ飛んでいく (z=100)
      warpGroupRef.current.position.z = THREE.MathUtils.lerp(-100, 100, easeOutT);
      // 通り過ぎる過程で少し巨大化
      warpGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.1, 2, easeOutT));
      // 混沌としすぎない、適度な回転
      warpGroupRef.current.rotation.x = state.clock.elapsedTime * 0.5 + THREE.MathUtils.lerp(0, Math.PI * 2, warpT);
      warpGroupRef.current.rotation.y = state.clock.elapsedTime * 0.5 + THREE.MathUtils.lerp(0, Math.PI, warpT);

      // 視野角（FOV）も徐々にゆっくりになる計算式で広げてマイルドにする
      state.camera.fov = THREE.MathUtils.lerp(60, 90, easeOutT);
      state.camera.updateProjectionMatrix();
    }

    // Cinematic Title Section: すべてのモデルが過ぎ去った後（0.7〜1.0）にフェードインして浮かび上がる
    if (titleGroupRef.current) {
      const warpT = scroll.range(0.85, 0.15);
      const easeOutT = 1 - Math.pow(1 - warpT, 2);

      // 0.7 から 1.0 にかけてOpacityを0から1へ
      const titleOpacity = Math.max(0, (easeOutT - 0.7) * 3.33);
      if (titleMatRef.current) titleMatRef.current.opacity = titleOpacity;
      if (subtitleMatRef.current) subtitleMatRef.current.opacity = titleOpacity;

      // 遠くからゆっくりとカメラに近づいてくる
      titleGroupRef.current.position.z = THREE.MathUtils.lerp(-50, -10, easeOutT);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
      <directionalLight position={[-10, -10, -10]} intensity={2} color="#ff00cc" />
      <Environment preset="city" />
      <Stars radius={150} depth={50} count={5000} factor={5} saturation={1} fade speed={1} />
      <Sparkles count={1000} scale={50} size={5} speed={0.2} color="#ff00cc" />

      {/* Background Swarm */}
      <group ref={swarmGroupRef}>
        {items.map((item, i) => {
          const gltf = gltfs[item.modelIndex];
          if (!gltf || !gltf.scene) return null;
          return (
            <Clone key={i} object={gltf.scene} position={item.position} rotation={item.rotation} scale={item.scale} deep />
          );
        })}
      </group>

      {/* Hero Models - 3. Removed .clone() from primitives. Since they are used only once, they don't need cloning. */}
      <group ref={duckRef} position={DUCK_POS}>
        {duckGLTF.scene && <primitive object={duckGLTF.scene} scale={5} />}
      </group>
      <group ref={helmetRef} position={HELMET_POS}>
        {helmetGLTF.scene && <primitive object={helmetGLTF.scene} scale={6} />}
      </group>
      <group ref={avocadoRef} position={AVOCADO_POS}>
        {avocadoGLTF.scene && <primitive object={avocadoGLTF.scene} scale={100} />}
      </group>

      {/* 5. Fox Stampede */}
      <FoxStampede />

      <group ref={warpGroupRef} scale={0}>
        {islandGLTF.scene && <primitive object={islandGLTF.scene} />}
      </group>

      {/* 6. Cinematic 3D Title (Replaces HTML text) */}
      <group ref={titleGroupRef}>
        <Text position={[0, 2, 0]} fontSize={4} anchorX="center" anchorY="middle">
          BEYOND THE VOID
          <meshStandardMaterial ref={titleMatRef} transparent opacity={0} color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </Text>
        <Text position={[0, -2, 0]} fontSize={1} anchorX="center" anchorY="middle">
          The singularity has enveloped the horizon.
          <meshStandardMaterial ref={subtitleMatRef} transparent opacity={0} color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
        </Text>
      </group>

      {/* 7. Back to Top Interactive Fox */}
      <BackToTopFox />
    </>
  );
}

export default function Home() {
  return (
    <div className="home-page">
      <div className="chaos-overlay"></div>

      <div className="canvas-container" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
          <Suspense fallback={null}>
            <ScrollControls pages={6} damping={0.25}>
              <MasterScene />

              <Scroll html style={{ width: '100%' }}>
                <div className="scroll-container">
                  <div className="section pointer-none" style={{ height: '100vh' }}>
                    <h1>Dimensional Chaos</h1>
                    <p>The universe has expanded. Entities swarm the void.</p>
                  </div>

                  <div className="section section-duck pointer-none" style={{ height: '100vh' }}>
                    <h2>Duck Anomaly Detected</h2>
                    <p>Sliding perfectly into the center from the left dimension.</p>
                  </div>

                  <div className="section section-helmet pointer-none" style={{ height: '100vh' }}>
                    <h2>Helmet Artifact</h2>
                    <p>Dropping rapidly from the upper stratosphere.</p>
                  </div>

                  <div className="section section-avocado pointer-none" style={{ height: '100vh' }}>
                    <h2>The Great Avocado</h2>
                    <p>Breaching the perimeter from the right.</p>
                  </div>

                  <div className="section section-fox pointer-none" style={{ height: '100vh' }}>
                    <h2>Fox Stampede</h2>
                    <p>A massive pack of foxes migrating across the dimensions.</p>
                  </div>

                  <div className="section section-warp pointer-none" style={{ height: '100vh' }}>
                    {/* HTMLのテキストは削除し、Canvas内の3Dタイトル（Text）に任せる */}
                  </div>
                </div>
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
