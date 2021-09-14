<script lang="ts">
<<<<<<< Updated upstream
	import { writable } from 'svelte/store';
	import Button from './components/button/Button.svelte';
	import {of, BehaviorSubject, from, toArray} from 'rxjs'
	import { fromFetch } from 'rxjs/fetch';
	import {
		map,
		concatMap,
		catchError,
		switchMap,
		startWith,
		debounceTime
	} from 'rxjs/operators';
	import { observe } from 'svelte-observable';
	import { Pokemon } from 'pokemon';

	const count = writable(0);

	count.subscribe(value => {
		console.log(value);
	}); // logs '0'

	export let name: string;

	const pokemon$ = fromFetch(`https://pokeapi.co/api/v2/pokemon?limit=151`).pipe(
		switchMap((response) => {
			if (response.ok) {
				return response.json();
			} else {
				return of({ error: true, message: `Error ${response.status}` })
			}
		}),
			map((res: any) => res.results),
		switchMap(results => { // split the array into a stream
			return from(results);
		}),
		concatMap((poke) => {
			return fromFetch(poke.url).pipe(
					switchMap((response) => {
						if (response.ok) {
							return response.json();
						} else {
							return of({ error: true, message: `Error ${response.status}` })
						}
					}),
			)
		}),
		toArray(),
		catchError((err) => of({ error: true, message: err.message })),
	);

	const pokemon: ReadableStream<Pokemon[]> = observe(pokemon$);
=======
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
        color: 0xD7CCC9,
        roughness: 0.1,
        metalness: 0.5
    });
    let torus: Mesh;
    // --- Lights & Helpers ---
    const ambientLight = new THREE.AmbientLight(0xFFFFFF);
    const pointLight = new THREE.PointLight(0xFA3600);
    const pointLight2 = new THREE.PointLight(0x009BFA);
    pointLight.position.set(20, 20, 20);
    pointLight2.position.set(-20, 20, 20);
    const lightHelper = new THREE.PointLightHelper(pointLight);
    const gridHelper = new THREE.GridHelper(200, 50);

    const gui = new dat.GUI();

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
        let extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 100, steps: 5, bevelSize: 0.1, bevelThickness: 10 };
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

>>>>>>> Stashed changes

    window.addEventListener( 'mousemove', onDocumentMouseMove);

    function onDocumentMouseMove(event: Event) {
        //mouseX = (event.clientX - windowY)
    }

</script>
<<<<<<< Updated upstream
<main class="p-8">
	<h1 class="text-8xl text-center my-8 uppercase text-red-500">Svelte</h1>
	<h2 class="text-4xl text-center">Also tailwindcss, Hello {name}</h2>

	<div class="my-2 text-center">
		<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl py-8">
			<div class="m-4 text-2xl text-center">
				{#if ($count === 0)}
					Counter leer
				{:else}
					{$count}
				{/if}
			</div>
			<Button text="increase" on:click={() => count.update(n => n + 1)}
					on:dblclick={() => count.update(n => n*n-n)}/>
			<Button text="decrease" on:click={() => $count > 0
				? count.update(n => n - 1)
				: alert('Counter kann nicht weniger als 0 sein!')}/>
		</div>
	</div>
	<div class="text-center uppercase">

	</div>
	<div class="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-5">
		{#await $pokemon}
			Values will be changed when calling next instead of subscribe (o.O?)
		{:then poke}
			{#each poke as p (p)}
				<div class="rounded overflow-hidden shadow-lg">
					<img class="w-auto h-4xl m-auto" src={p.sprites.front_default} alt={p.name}>
					<div class="px-6 py-4">
						<div class="font-bold text-xl mb-2 uppercase">{p.name}</div>
						<p class="text-gray-700 text-base">
							Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
						</p>
					</div>
					<div class="px-6 pt-4 pb-2">
						{#each p.types as type}
							<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{type.type.name}</span>
						{/each}
					</div>
				</div>
			{/each}
		{:catch error}
			{@debug error}
		{/await}
	</div>

</main>
=======

<div class="text uppercase m-a">I love you Victoria, yours Dominik</div>
<canvas id="bg">
    <!-- threejs canvas -->
</canvas>
>>>>>>> Stashed changes

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	.btn {
		@apply font-bold py-2 px-4 rounded;
	}
	.btn-blue {
		@apply bg-blue-500 text-white;
	}
	.btn-blue:hover {
		@apply bg-blue-700;
	}
</style>