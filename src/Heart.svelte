<script lang="ts">
    import {onMount} from 'svelte';
    import * as THREE from 'three';
    import {_} from 'svelte-i18n';

    let isMounted = $state(false);
    let canvasElement: HTMLCanvasElement;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let heart: THREE.Mesh;
    let aspectRatio: number;

    // Accessibility translations
    let heartDescription = $derived($_('heart.description', {default: '3D animated heart visualization'}));

    function initThreeJs() {
        if (!canvasElement) {
            return;
        }

        scene = new THREE.Scene();
        aspectRatio = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(85, aspectRatio, 0.25, 2000);

        renderer = new THREE.WebGLRenderer({
            canvas: canvasElement,
            antialias: true
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.position.setZ(60);
        camera.position.setX(45);
        camera.position.setY(15);

        scene.background = new THREE.Color(0xfec5bb);

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.75,
            metalness: 0.5
        });

        const pointLight = new THREE.PointLight(0xFA3600);
        const pointLight2 = new THREE.PointLight(0x009BFA);
        pointLight.position.set(-20, 30, 20);
        pointLight2.position.set(20, -5, 20);
        scene.add(pointLight, pointLight2);

        Array(300).fill(null).forEach(() => addStar());

        addLove(material);

        animate();

        window.addEventListener('resize', onWindowResize, false);

        isMounted = true;
    }

    function addStar() {
        const geometry = new THREE.SphereGeometry(0.1, 10, 10);
        const material = new THREE.MeshToonMaterial({color: 0xFFFFFF});
        const star = new THREE.Mesh(geometry, material);

        const [x, y, z] = Array(3).fill(null).map(() => THREE.MathUtils.randFloatSpread(100));
        star.position.set(x, y, z);
        scene.add(star);
    }

    function addLove(material: THREE.MeshStandardMaterial) {
        let x = -25, y = 0;
        let heartShape = new THREE.Shape();
        heartShape.moveTo(x + 25, y + 25);
        heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
        heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
        heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
        heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
        heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
        heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

        const extrudeSettings = {depth: 4};
        const geometryHeart = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

        heart = new THREE.Mesh(geometryHeart, material);
        let flip = new THREE.Matrix4().makeScale(1, -1, 1);
        heart.applyMatrix4(flip);
        heart.translateY(-40);
        heart.scale.set(0.15, 0.15, 0.15);
        scene.add(heart);
    }

    function animate() {
        if (!isMounted) {
            return;
        }

        requestAnimationFrame(animate);

        if (heart) {
            heart.rotation.y += 0.01;
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function onWindowResize() {
        if (!camera || !renderer) return;

        aspectRatio = window.innerWidth / window.innerHeight;
        camera.aspect = aspectRatio;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    onMount(() => {
        if (canvasElement) {
            initThreeJs();
        } else {
            // Try to initialize after a short delay to ensure the canvas is bound
            setTimeout(() => {
                if (canvasElement) {
                    initThreeJs();
                }
            }, 100);
            return;
        }

        return () => {
            window.removeEventListener('resize', onWindowResize);

            if (renderer) {
                renderer.dispose();
            }
        };
    });

</script>

<div class="canvas-container"
     role="region"
     aria-label={heartDescription}>
    <canvas bind:this={canvasElement} aria-hidden="true"></canvas>
</div>

<style lang="postcss">
    .canvas-container {
        @apply fixed top-0 left-0 w-screen h-screen overflow-hidden;
        z-index: -10;
    }
    /* Define variables for heart canvas */
    :root {
        --heart-bg-color: #fec5bb;
    }

    canvas {
        @apply block w-full h-full max-w-full max-h-full;
        background-color: var(--heart-bg-color);
    }
</style>
