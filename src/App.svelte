<script lang="ts">
	import * as THREE from 'three';
    import {Camera, Mesh, Scene, Texture, WebGLRenderer} from "three";
    import {onMount} from "svelte";
    import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
    import * as dat from "dat.gui";

    const textureLoader = new THREE.TextureLoader();
    let normalTexture: Texture;
    let backgroundTexture: Texture;
    const scene: Scene = new THREE.Scene();
    let aspectRatio: number;
    let camera: Camera;
    let renderer: WebGLRenderer;
    let heart: Mesh;
    // --- TORUS SHAPE ---
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.75,
        metalness: 0.5,
        normalMap: normalTexture
    });
    let torus: Mesh;
    // --- Lights & Helpers ---
    const ambientLight = new THREE.AmbientLight(0xFFFFFF);
    const pointLight = new THREE.PointLight(0xFA3600);
    const pointLight2 = new THREE.PointLight(0x009BFA);
    pointLight.position.set(20, 30, 20);
    pointLight2.position.set(20, -5, 20);

    const lightHelper = new THREE.PointLightHelper(pointLight);
    const gridHelper = new THREE.GridHelper(200, 50);

    /*const gui = new dat.GUI();
    const folder1 = gui.addFolder('Pointlight Red');
    const folder2 = gui.addFolder('Pointlight Blue');
    const folder3 = gui.addFolder('Material');
    folder1.add(pointLight.position, 'x');
    folder1.add(pointLight.position, 'y');
    folder1.add(pointLight.position, 'z');
    folder1.add(pointLight, 'intensity');
    folder2.add(pointLight2.position, 'x');
    folder2.add(pointLight2.position, 'y');
    folder2.add(pointLight2.position, 'z');
    folder2.add(pointLight2, 'intensity');
    folder3.add(material.color, 'r');
    folder3.add(material.color, 'g');
    folder3.add(material.color, 'b');
    folder3.add(material, 'metalness');
    folder3.add(material, 'roughness');
    folder3.add(material, 'transparent');
    folder3.add(material, 'wireframe');
    folder3.add(material, 'refractionRatio');
    folder3.add(material, 'bumpScale');*/

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // --- Controls ---
    let controls: OrbitControls;

    onMount(async () => {
        aspectRatio = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera( 85, aspectRatio, 0.25, 2000);
        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
            antialias: true
        });
        controls = new OrbitControls(camera, renderer.domElement);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.position.setZ(30);
        camera.position.setX(15);
        camera.position.setY(15);
        normalTexture = await textureLoader.load("../assets/normalmap.png");
        backgroundTexture = await textureLoader.load("../assets/background.jpg");
        scene.background = backgroundTexture;
        material.normalMap = normalTexture;
        //torus = new THREE.Mesh( geometry, material );
        scene.add(pointLight, pointLight2);
        //scene.add(torus);
        // scene.add(lightHelper, gridHelper);
        // add stars
        Array(200).fill(null).map(addStar);

        addLove();
        animate();
    });

    function addStar() {
        const geometry = new THREE.SphereGeometry(0.1, 10, 10);
        const material = new THREE.MeshToonMaterial({color: 0xFFFFFF});
        const star = new THREE.Mesh( geometry, material );

        const [x, y, z] = Array(3).fill(null).map(() => THREE.MathUtils.randFloatSpread(100));
        star.position.set(x, y, z);
        scene.add(star);
    }


    function addLove() {

        let x = -25, y = 0;
        let heartShape = new THREE.Shape();
        heartShape.moveTo( x + 25, y + 25 );
        heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
        heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35,x - 30,y + 35 );
        heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
        heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
        heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
        heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );
        let extrudeSettings = { depth: 4 };
        const geometryHeart = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

        heart = new THREE.Mesh(geometryHeart, material);
        let flip = new THREE.Matrix4().makeScale(1,-1,1);
        heart.applyMatrix4(flip);
        heart.translateY(-20);
        heart.scale.set(0.15, 0.15, 0.15);
        scene.add(heart);
    }

    function animate() {
        requestAnimationFrame(animate);

        //heart.rotation.x += 0.01;
        heart.rotation.y += 0.01;


        controls.update();

        renderer.render(scene, camera);
    }



    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {
        aspectRatio = window.innerWidth / window.innerHeight;
        (camera as any).aspect = window.innerWidth / window.innerHeight;
        (camera as any).updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }


    window.addEventListener( 'mousemove', onDocumentMouseMove);

    function onDocumentMouseMove(event: Event) {
        //mouseX = (event.clientX - windowY)
    }

    function toggleOverlay() {
        const overlay_right = document.getElementById('overlay_right');
        const overlay_left = document.getElementById('overlay_left');
        const button = document.getElementById('overlay_button');

        overlay_left.classList.add('scale-down-hor-right');
        overlay_right.classList.add('scale-down-hor-left');
        button.classList.add('rotate-center');
    }

</script>
<div id="overlay_left"></div>
<div id="overlay_right"></div>
<div id="overlay_button" class="heart-shape" on:click={toggleOverlay}></div>
<div class="text uppercase m-a">Victoria, Te amo!!! Tu Dominik</div>
<canvas id="bg">
    <!-- threejs canvas -->
</canvas>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
    :root {
        --primary-color: #fec5bb;
        --secondary-color: #f8edeb;
    }

    .text {
        position: absolute;
        bottom: 1em;
        color: white;
        font-size: 2.5em;
        text-align: center;
        width: 100%;
    }

    #overlay_left {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        width: 50vw;
        height: 100vh;
        background: var(--primary-color);
    }
    #overlay_right {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 50vw;
        height: 100vh;
        background: var(--primary-color);
    }

    #overlay_button {
        position: absolute;
        z-index: 2;
        background: var(--secondary-color);
        margin-left: auto;
        margin-right: auto;
        top: calc(50% - 100px);  /* position the top  edge of the element at the middle of the parent */
        left: calc(50% - 90px); /* position the left edge of the element at the middle of the parent */
    }

    .scale-down-hor-right {
        animation: scale-down-hor-right 2.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
    .scale-down-hor-left {
        animation: scale-down-hor-left 2.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
    .rotate-center {
        animation: rotate-center 2.5s ease-in-out both;
    }
    /**
     * ----------------------------------------
     * animation scale-down-hor-left
     * ----------------------------------------
     */
    @keyframes scale-down-hor-left {
        0% {
            transform: scaleX(1);
            transform-origin: 0% 0%;
        }
        100% {
            transform: scaleX(0);
            transform-origin: 0% 0%;
        }
    }
    @keyframes scale-down-hor-right {
        0% {
            transform: scaleX(1);
            transform-origin: 100% 100%;
        }
        100% {
            transform: scaleX(0);
            transform-origin: 100% 100%;
        }
    }
    @keyframes rotate-center {
        0% {
            transform: rotate(42deg);
            opacity: 1.0;
        }
        25% {
            opacity: 0.75;
        }
        50% {
            opacity: 0.5;
        }
        75% {
            opacity: 0.25;
        }
        100% {
            opacity: 0;
            transform: rotate(405deg);
        }
    }

    #bg {
        z-index: 0;
    }

    .heart-shape {
        position: relative;
        width: 200px;
        height: 200px;
        transform: rotate(45deg);
        background-color: var(--secondary-color);
        box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);
    }
    .heart-shape:before, .heart-shape:after {
        position: absolute;
        width: 200px;
        height: 200px;
        content: '';
        border-radius: 50%;
        background-color: var(--secondary-color);
    }
    .heart-shape:before {
        bottom: 0;
        left: -100px;
    }
    .heart-shape:after {
        top: -100px;
        right: 0;
    }
</style>