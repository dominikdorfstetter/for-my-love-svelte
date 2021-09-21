<script lang="ts">
    import * as THREE from "three";
    import {Camera, Mesh, Scene, Texture, WebGLRenderer} from "three";
    import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
    import {onMount} from "svelte";

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

    // --- Lights & Helpers ---
    const ambientLight = new THREE.AmbientLight(0xFFFFFF);
    const pointLight = new THREE.PointLight(0xFA3600);
    const pointLight2 = new THREE.PointLight(0x009BFA);
    pointLight.position.set(20, 30, 20);
    pointLight2.position.set(20, -5, 20);

    const lightHelper = new THREE.PointLightHelper(pointLight);
    const gridHelper = new THREE.GridHelper(200, 50);

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
        camera.position.setZ(50);
        camera.position.setX(25);
        camera.position.setY(15);
        normalTexture = await textureLoader.load("../assets/normalmap.png");
        backgroundTexture = await textureLoader.load("../assets/background.jpg");
        scene.background = new THREE.Color(0xfec5bb);
        material.normalMap = normalTexture;
        scene.add(pointLight, pointLight2);

        // add stars
        Array(300).fill(null).map(addStar);

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
</script>

<canvas style="max-width: 100%; max-height: 100%" id="bg">
    <!-- threejs canvas -->
</canvas>

<style lang="postcss">
    #bg {
        z-index: 0;
    }
</style>