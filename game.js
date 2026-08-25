// Fantasy 3D Pixel Forest Game - Three.js Implementation

let scene, camera, renderer, player, world;

class Game {
    constructor() {
        this.initScene();
        this.createWorld();
        this.createPlayer();
        this.setupControls();
        this.setupLights();
        this.animate();
    }

    initScene() {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        scene.fog = new THREE.Fog(0x1a1a2e, 100, 300);

        // Camera
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 10);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        scene.add(ambientLight);

        // Directional light (sun/moon)
        const directionalLight = new THREE.DirectionalLight(0x8833ff, 1.2);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        scene.add(directionalLight);

        // Point lights for magical effect
        const pointLight = new THREE.PointLight(0x00ff88, 0.5, 50);
        pointLight.position.set(0, 20, 0);
        scene.add(pointLight);
    }

    createWorld() {
        world = new World();
        world.generate(scene);
    }

    createPlayer() {
        player = new Player(camera);
    }

    setupControls() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        document.addEventListener('mousemove', (e) => player.updateLook(e.movementX, e.movementY));
        document.addEventListener('click', () => document.body.requestPointerLock?.());
    }

    updatePlayer() {
        const moveSpeed = 0.5;
        const direction = new THREE.Vector3();

        if (this.keys['w']) direction.z -= 1;
        if (this.keys['s']) direction.z += 1;
        if (this.keys['a']) direction.x -= 1;
        if (this.keys['d']) direction.x += 1;

        if (direction.length() > 0) {
            direction.normalize();
            player.move(direction, moveSpeed);
        }

        if (this.keys[' ']) player.jump();
        if (this.keys['m']) player.toggleMusic();

        player.update();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updatePlayer();
        this.updateUI();
        renderer.render(scene, camera);
    }

    updateUI() {
        const pos = camera.position;
        document.getElementById('pos').textContent = 
            `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
        
        // FPS counter
        const now = performance.now();
        if (!this.lastTime) this.lastTime = now;
        const delta = now - this.lastTime;
        this.lastTime = now;
        const fps = Math.round(1000 / delta);
        document.getElementById('fps').textContent = fps;
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

class Player {
    constructor(camera) {
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.rotation = { x: 0, y: 0 };
        this.musicEnabled = false;
    }

    move(direction, speed) {
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(this.camera.up, cameraDirection).normalize();

        const moveVector = new THREE.Vector3();
        moveVector.addScaledVector(cameraDirection, direction.z);
        moveVector.addScaledVector(right, direction.x);

        this.camera.position.addScaledVector(moveVector, speed);
    }

    jump() {
        if (!this.isJumping) {
            this.velocity.y = 0.5;
            this.isJumping = true;
        }
    }

    updateLook(deltaX, deltaY) {
        const sensitivity = 0.003;
        this.rotation.y -= deltaX * sensitivity;
        this.rotation.x -= deltaY * sensitivity;
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.rotation.y;
        this.camera.rotation.x = this.rotation.x;
    }

    update() {
        // Gravity
        this.velocity.y -= 0.02;
        this.camera.position.y += this.velocity.y;

        // Ground collision
        if (this.camera.position.y < 2) {
            this.camera.position.y = 2;
            this.velocity.y = 0;
            this.isJumping = false;
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
    }
}

class World {
    generate(scene) {
        this.createTerrain(scene);
        this.createTrees(scene);
        this.createMagicalElements(scene);
        this.createRocks(scene);
    }

    createTerrain(scene) {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d5016,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add ground texture variation
        const grassGeometry = new THREE.PlaneGeometry(500, 500);
        const grassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a3a0a,
            roughness: 0.9
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.z = -0.01;
        grass.receiveShadow = true;
        scene.add(grass);
    }

    createTrees(scene) {
        const treePositions = [
            [-20, 0, -30], [20, 0, -40], [-10, 0, -50],
            [30, 0, -20], [-30, 0, 10], [40, 0, 30],
            [-40, 0, -10], [10, 0, -60], [-50, 0, -50],
            [50, 0, -30], [-25, 0, 25], [15, 0, 50]
        ];

        treePositions.forEach(pos => {
            this.createTree(scene, pos[0], pos[1], pos[2]);
        });
    }

    createTree(scene, x, y, z) {
        // Trunk
        const trunkGeometry = new THREE.BoxGeometry(2, 8, 2);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3d2817,
            roughness: 0.7
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, y + 4, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);

        // Foliage (cone shape with pixelated look)
        const foliageGeometry = new THREE.ConeGeometry(6, 12, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a4d1a,
            roughness: 0.6,
            emissive: 0x0a3a0a
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, y + 10, z);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        scene.add(foliage);

        // Add additional foliage layers
        const foliage2Geometry = new THREE.ConeGeometry(5, 10, 8);
        const foliage2 = new THREE.Mesh(foliage2Geometry, foliageMaterial);
        foliage2.position.set(x, y + 14, z);
        foliage2.castShadow = true;
        foliage2.receiveShadow = true;
        scene.add(foliage2);
    }

    createMagicalElements(scene) {
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 50 + 10;
            const z = (Math.random() - 0.5) * 200;

            const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const glowMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                emissive: new THREE.Color().setHSL(Math.random(), 1, 0.5),
                metalness: 0.8,
                roughness: 0.2
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, y, z);
            glow.castShadow = true;
            scene.add(glow);
        }
    }

    createRocks(scene) {
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            const scale = Math.random() * 1.5 + 0.5;

            const rockGeometry = new THREE.IcosahedronGeometry(1, 2);
            const rockMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x4a4a4a,
                roughness: 0.8,
                metalness: 0.1
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, 0.5 * scale, z);
            rock.scale.set(scale, scale, scale);
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
        }
    }
}

// Start the game
window.addEventListener('load', () => {
    new Game();
});