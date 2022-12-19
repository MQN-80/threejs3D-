import * as THREE from '../build/three.module.js';

import Stats from '../build/jsm/libs/stats.module.js';

import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader";

import { Octree } from '../build/jsm/math/Octree.js';
import { OctreeHelper } from '../build/jsm/helpers/OctreeHelper.js';

import { Capsule } from '../build/jsm/math/Capsule.js';

import { GUI } from '../build/jsm/libs/lil-gui.module.min.js';
import snake from './snake.js';
import Snow from './snow.js';
import snowImg from "../assets/imgs/snow.png";
import FoodSet from "./FoodSet";
import {randInt} from "three/src/math/MathUtils";

/* === 初始化场景 === */
const clock = new THREE.Clock();
const scene = new THREE.Scene();
var changeTime=0;
scene.background = new THREE.Color( 0x000000 );
scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );
/* =================*/

//实例化蛇对象
const Snake=new snake(scene)

//实例化雪花
const snow = new Snow(10000, 100, snowImg)
scene.add(snow.particle)

//实例化食物
const FOODSET =new FoodSet(scene);
FOODSET.setFood(randInt(1,5));


/* ========== 相机 ========= */
/* 第一人称相机 */
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.rotation.order = 'YXZ';


/*=============================*/

/* === 半球光源 === */
const fillLight1 = new THREE.HemisphereLight( 0x4488bb, 0x002244, 0.5 );
fillLight1.position.set( 2, 1, 1 );
scene.add( fillLight1 );

/* ==== 太阳光源，调用sun函数 ==== */
let r = 0
let sun = new Sun(7);
let directionalLight = new THREE.DirectionalLight(0x263238, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(sun)
/* =========  ========= */


/* 网页容器 */
const container = document.getElementById( 'container' );
console.log(container)
/* 渲染器 */
const renderer = new THREE.WebGLRenderer( { antialias: true } );
// /* ============= 渲染 部分 ============= */
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild( renderer.domElement );
/*===*/

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

/* ========宏常量======= */
const GRAVITY = 30;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;

const STEPS_PER_FRAME = 5;

const sphereGeometry = new THREE.IcosahedronGeometry( SPHERE_RADIUS, 5 );
const sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xbbbb44 } );

const spheres = [];
let sphereIdx = 0;

for ( let i = 0; i < NUM_SPHERES; i ++ ) {

	const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.castShadow = true;
	sphere.receiveShadow = true;

	scene.add( sphere );

	spheres.push( {
		mesh: sphere,
		collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ),
		velocity: new THREE.Vector3()
	} );

}

const worldOctree = new Octree();

const playerCollider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

document.addEventListener( 'keydown', ( event ) => {

	keyStates[ event.code ] = true;

} );

document.addEventListener( 'keyup', ( event ) => {

	keyStates[ event.code ] = false;

} );

container.addEventListener( 'mousedown', () => {

	document.body.requestPointerLock();

	mouseTime = performance.now();

} );

/*document.addEventListener( 'mouseup', () => {

	if ( document.pointerLockElement !== null ) throwBall();

} );*/

document.body.addEventListener( 'mousemove', ( event ) => {

	if ( document.pointerLockElement === document.body ) {

		camera.rotation.y -= event.movementX / 500;
		camera.rotation.x -= event.movementY / 500;

	}

} );

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

/*
function throwBall() {

	const sphere = spheres[ sphereIdx ];

	camera.getWorldDirection( playerDirection );

	sphere.collider.center.copy( playerCollider.end ).addScaledVector( playerDirection, playerCollider.radius * 1.5 );

	// throw the ball with more force if we hold the button longer, and if we move forward

	const impulse = 15 + 30 * ( 1 - Math.exp( ( mouseTime - performance.now() ) * 0.001 ) );

	sphere.velocity.copy( playerDirection ).multiplyScalar( impulse );
	sphere.velocity.addScaledVector( playerVelocity, 2 );

	sphereIdx = ( sphereIdx + 1 ) % spheres.length;

}
*/

function playerCollisions() {

	const result = worldOctree.capsuleIntersect( playerCollider );

	playerOnFloor = false;
	if ( result ) {
		playerOnFloor = result.normal.y > 0;
        //console.log(result.normal)
		if ( ! playerOnFloor ) {
	        //console.log(result.normal)

			playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );
			//alert("发生碰撞,游戏重新开始")
			//location.reload()

		}
		playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

	}

}

function updatePlayer( deltaTime ) {

	let damping = Math.exp( - 4 * deltaTime ) - 1;

	if ( ! playerOnFloor ) {

		playerVelocity.y -= GRAVITY * deltaTime;

		// small air resistance
		damping *= 0.1;

	}

	playerVelocity.addScaledVector( playerVelocity, damping );

	const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
	playerCollider.translate( deltaPosition );

	playerCollisions();

	camera.position.copy( playerCollider.end );
	Snake.forward(playerCollider.end);

}

function playerSphereCollision( sphere ) {

	const center = vector1.addVectors( playerCollider.start, playerCollider.end ).multiplyScalar( 0.5 );

	const sphere_center = sphere.collider.center;

	const r = playerCollider.radius + sphere.collider.radius;
	const r2 = r * r;

	// approximation: player = 3 spheres

	for ( const point of [ playerCollider.start, playerCollider.end, center ] ) {

		const d2 = point.distanceToSquared( sphere_center );

		if ( d2 < r2 ) {

			const normal = vector1.subVectors( point, sphere_center ).normalize();
			const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( playerVelocity ) );
			const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( sphere.velocity ) );

			playerVelocity.add( v2 ).sub( v1 );
			sphere.velocity.add( v1 ).sub( v2 );

			const d = ( r - Math.sqrt( d2 ) ) / 2;
			sphere_center.addScaledVector( normal, - d );

		}

	}

}

function spheresCollisions() {

	for ( let i = 0, length = spheres.length; i < length; i ++ ) {

		const s1 = spheres[ i ];

		for ( let j = i + 1; j < length; j ++ ) {

			const s2 = spheres[ j ];

			const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
			const r = s1.collider.radius + s2.collider.radius;
			const r2 = r * r;

			if ( d2 < r2 ) {

				const normal = vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
				const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
				const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

				s1.velocity.add( v2 ).sub( v1 );
				s2.velocity.add( v1 ).sub( v2 );

				const d = ( r - Math.sqrt( d2 ) ) / 2;

				s1.collider.center.addScaledVector( normal, d );
				s2.collider.center.addScaledVector( normal, - d );

			}

		}

	}

}

function updateSpheres( deltaTime ) {

	spheres.forEach( sphere => {

		sphere.collider.center.addScaledVector( sphere.velocity, deltaTime );

		const result = worldOctree.sphereIntersect( sphere.collider );

		if ( result ) {

			sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
			sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

		} else {

			sphere.velocity.y -= GRAVITY * deltaTime;

		}

		const damping = Math.exp( - 1.5 * deltaTime ) - 1;
		sphere.velocity.addScaledVector( sphere.velocity, damping );

		playerSphereCollision( sphere );

	} );

	spheresCollisions();

	for ( const sphere of spheres ) {

		sphere.mesh.position.copy( sphere.collider.center );

	}

}

function getForwardVector() {

	camera.getWorldDirection( playerDirection );
	playerDirection.y = 0;
	playerDirection.normalize();

	return playerDirection;

}

function getSideVector() {

	camera.getWorldDirection( playerDirection );
	playerDirection.y = 0;
	playerDirection.normalize();
	playerDirection.cross( camera.up );

	return playerDirection;

}

function controls( deltaTime ) {

	// gives a bit of air control
	const speedDelta = deltaTime * ( playerOnFloor ? 25 : 8 );

	if ( keyStates[ 'KeyW' ] ) {

		playerVelocity.add( getForwardVector().multiplyScalar( speedDelta ) );

	}

	if ( keyStates[ 'KeyS' ] ) {

		playerVelocity.add( getForwardVector().multiplyScalar( - speedDelta ) );
	}

	if ( keyStates[ 'KeyA' ] ) {

		playerVelocity.add( getSideVector().multiplyScalar( - speedDelta ) );

	}

	if ( keyStates[ 'KeyD' ] ) {

		playerVelocity.add( getSideVector().multiplyScalar( speedDelta ) );

	}

/*
	if ( playerOnFloor ) {

		if ( keyStates[ 'Space' ] ) {

			playerVelocity.y = 15;

		}

	}
*/

}

const loader = new GLTFLoader();
loader.load( 'collision-world.glb', ( gltf ) => {
	scene.add( gltf.scene);
	worldOctree.fromGraphNode( gltf.scene );
	
	gltf.scene.traverse( child => {

		if ( child.isMesh ) {

			child.castShadow = true;
			child.receiveShadow = true;

			if ( child.material.map ) {

				child.material.map.anisotropy = 4;

			}

		}

	} );

	const helper = new OctreeHelper( worldOctree );
	helper.visible = false;
	scene.add( helper );

	const gui = new GUI( { width: 200 } );
	gui.add( { debug: false }, 'debug' )
		.onChange( function ( value ) {

			helper.visible = value;

		} );

	animate();

},(err)=>{
	console.log(err);

},(err)=>{
	console.log(err);

});

function teleportPlayerIfOob() {

	if ( camera.position.y <= - 25 ) {

		playerCollider.start.set( 0, 0.35, 0 );
		playerCollider.end.set( 0, 1, 0 );
		playerCollider.radius = 0.35;
		camera.position.copy( playerCollider.end );
		camera.rotation.set( 0, 0, 0 );

	}

}


/* ======太阳========*/
function Sun(radius) {
	var pointLight = {},
		sun = {},
		sunGeometry = {},
		sunMaterial = {};

	/* === 太阳网格 === */
	sunGeometry = new THREE.SphereGeometry(radius, 10, 10);
	sunMaterial = new THREE.MeshBasicMaterial({
		color: 0xfdd835
	});
	sun = new THREE.Mesh(sunGeometry, sunMaterial);
	sun.position.set(0, 25, 0);  //初始位置随意
	/* ================ */

	// /* ==== 点光源 ==== */ //无法产生阴影
	pointLight = new THREE.PointLight(0xE65100, 4, 200);
	pointLight.position.set(0, 0, 0);
	pointLight.castShadow = true  //产生阴影
	pointLight.shadow.mapSize.width = 2048
	pointLight.shadow.mapSize.height = 2048
	sun.add(pointLight);

	// pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
	// scene.add( pointLightHelper );

	return sun;
}

function animate() {

	/* ========天气 ===========*/
	snow.snowing(0.3) // 下雪
	/* == 太阳动画 == */
	sun.position.x = Math.sin(r * 0.0155) * 50;
	sun.position.y = Math.cos(r * 0.0155) * 50;
	r += Math.PI / 180 * 2;
	/* =============== */


	const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

	// we look for collisions in substeps to mitigate the risk of
	// an object traversing another too quickly for detection.

	for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

		controls( deltaTime );

		updatePlayer( deltaTime );

		updateSpheres( deltaTime );

		teleportPlayerIfOob();

	}
    changeTime++;
	if(changeTime==5)
	{
		Snake.bodyMove();
		changeTime=0;
	}
	renderer.render( scene, camera );

	stats.update();

	requestAnimationFrame( animate );
	const speedDelta = deltaTime * ( playerOnFloor ? 25 : 8 );
	//保持一直向前运动
	playerVelocity.add( getForwardVector().multiplyScalar( speedDelta*5 ) );

	if(FOODSET.isEat(camera.position))
	{
		Snake.addBody();
		FOODSET.setFood(randInt(1,5));
	}

	//食物旋转
	FOODSET.rotation();
}
