// 🎮 FANTASY 3D FOREST - ADVANCED EDITION 🎮
// 10x Better with NPCs, Combat, Particles, Weather, Advanced Physics

let scene, camera, renderer, player, world, physics, audioContext;
let enemies = [], npcs = [], particles = [];
let gameState = { paused: false, level: 1, xp: 0, gold: 0 };
const gameConfig = {
    renderDistance: 500,
    npcCount: 8,
    enemyCount: 15,
    particlePoolSize: 1000
};

class AdvancedGame {
    constructor() {
        this.initAudio();
        this.initScene();
        this.setupPhysics();
        this.createWorld();
        this.createPlayer();
        this.createNPCs();
        this.createEnemies();
        this.setupControls();
        this.setupLights();
        this.initializeWeather();
        this.animate();
        console.log('🎮 Advanced Fantasy Game Initialized!');
        document.getElementById('loading').style.display = 'none';
    }

    initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    initScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a15);
        scene.fog = new THREE.Fog(0x0a0a15, 150, 400);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 15);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        renderer.shadowMap.resolution = 4096;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupPhysics() {
        // Simplified physics without Cannon-ES
        physics = {
            gravity: 9.82,
            bodies: []
        };
    }

    setupLights() {
        // Dynamic ambient lighting
        const ambientLight = new THREE.AmbientLight(0x4a4a6a, 1.8);
        scene.add(ambientLight);

        // Main directional light with advanced shadows
        const sunLight = new THREE.DirectionalLight(0x8844ff, 1.5);
        sunLight.position.set(100, 80, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.set(4096, 4096);
        sunLight.shadow.camera.far = 300;
        sunLight.shadow.camera.left = -150;
        sunLight.shadow.camera.right = 150;
        sunLight.shadow.camera.top = 150;
        sunLight.shadow.camera.bottom = -150;
        sunLight.shadow.bias = -0.0001;
        scene.add(sunLight);

        // Atmospheric lights
        const purpleLight = new THREE.PointLight(0x7744ff, 0.8, 200);
        purpleLight.position.set(-100, 50, 0);
        scene.add(purpleLight);

        const greenLight = new THREE.PointLight(0x00dd88, 0.6, 150);
        greenLight.position.set(100, 40, 100);
        scene.add(greenLight);
    }

    createWorld() {
        world = new AdvancedWorld();
        world.generate(scene, physics);
    }

    createPlayer() {
        player = new AdvancedPlayer(camera, physics);
    }

    createNPCs() {
        const npcPositions = [
            { pos: [-50, 2, -60], type: 'merchant', name: '🧙 Aldric' },
            { pos: [60, 2, -40], type: 'warrior', name: '⚔️ Kael' },
            { pos: [-30, 2, 30], type: 'mage', name: '✨ Lyra' },
            { pos: [40, 2, 50], type: 'archer', name: '🏹 Theron' },
            { pos: [0, 2, -80], type: 'healer', name: '💚 Sera' },
            { pos: [-80, 2, 0], type: 'rogue', name: '🗡️ Shade' },
            { pos: [80, 2, -80], type: 'paladin', name: '⚖️ Marcus' },
            { pos: [-60, 2, 60], type: 'sorcerer', name: '🔮 Morgana' }
        ];

        npcPositions.forEach(npc => {
            const newNPC = new NPC(npc.pos, npc.type, npc.name, scene);
            npcs.push(newNPC);
        });
    }

    createEnemies() {
        for (let i = 0; i < gameConfig.enemyCount; i++) {
            const angle = (Math.random() - 0.5) * Math.PI * 2;
            const distance = Math.random() * 150 + 50;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const type = ['goblin', 'skeleton', 'troll', 'wraith'][Math.floor(Math.random() * 4)];
            const enemy = new Enemy(x, 2, z, type, scene, physics);
            enemies.push(enemy);
        }
    }

    setupControls() {
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'p') gameState.paused = !gameState.paused;
            if (e.key === 'Escape') console.log('Exiting game...');
            if (e.key === 'q') player.castSpell();
            if (e.key === 'r') player.reload();
        });
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

        document.addEventListener('mousemove', (e) => {
            if (!gameState.paused) player.updateLook(e.movementX, e.movementY);
        });
        
        document.addEventListener('mousedown', (e) => {
            if (!gameState.paused) {
                if (e.button === 0) player.attack();
                document.body.requestPointerLock?.();
            }
        });
    }

    initializeWeather() {
        this.weather = {
            type: 'clear',
            intensity: 0.5,
            particles: []
        };
        this.updateWeather();
    }

    updateWeather() {
        const weatherTypes = ['clear', 'rain', 'mist'];
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        if (newWeather !== this.weather.type) {
            this.weather.type = newWeather;
            
            // Clear old weather particles
            this.weather.particles.forEach(p => scene.remove(p));
            this.weather.particles = [];

            if (newWeather === 'rain') {
                for (let i = 0; i < 200; i++) {
                    const x = (Math.random() - 0.5) * 300;
                    const y = Math.random() * 200 + 50;
                    const z = (Math.random() - 0.5) * 300;
                    const drop = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.1, 0.1, 2),
                        new THREE.MeshStandardMaterial({ color: 0x4488ff, transparent: true, opacity: 0.6 })
                    );
                    drop.position.set(x, y, z);
                    drop.castShadow = true;
                    scene.add(drop);
                    this.weather.particles.push(drop);
                }
            }
        }
        document.getElementById('weather').textContent = this.weather.type.toUpperCase();
    }

    updatePlayer() {
        if (gameState.paused) return;

        const moveSpeed = this.keys['shift'] ? 0.8 : 0.5;
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
        player.update();

        // Update camera position for minimap
        this.updateMinimap();
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 200, 200);
        
        const scale = 0.5;
        const centerX = 100;
        const centerY = 100;
        
        // Draw player
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
        
        // Draw enemies
        ctx.fillStyle = '#ff0000';
        enemies.forEach(e => {
            const x = centerX + (e.mesh.position.x - camera.position.x) * scale;
            const y = centerY + (e.mesh.position.z - camera.position.z) * scale;
            if (x > 0 && x < 200 && y > 0 && y < 200) {
                ctx.fillRect(x - 3, y - 3, 6, 6);
            }
        });
        
        // Draw NPCs
        ctx.fillStyle = '#ffaa00';
        npcs.forEach(n => {
            const x = centerX + (n.mesh.position.x - camera.position.x) * scale;
            const y = centerY + (n.mesh.position.z - camera.position.z) * scale;
            if (x > 0 && x < 200 && y > 0 && y < 200) {
                ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        });
    }

    updateEnemies() {
        enemies = enemies.filter(e => e.health > 0);
        enemies.forEach(enemy => enemy.update(player.camera.position, player));
    }

    updateNPCs() {
        npcs.forEach(npc => npc.update());
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!gameState.paused) {
            this.updatePlayer();
            this.updateEnemies();
            this.updateNPCs();
        }
        
        this.updateUI();
        renderer.render(scene, camera);
    }

    updateUI() {
        const pos = camera.position;
        document.getElementById('pos').textContent = `${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)}`;
        document.getElementById('rot').textContent = `${(camera.rotation.y * 180 / Math.PI).toFixed(2)}°`;
        
        // HP/Mana
        document.getElementById('hp').textContent = Math.max(0, player.health);
        document.getElementById('mana').textContent = player.mana;
        document.getElementById('hp-bar').style.width = (player.health / player.maxHealth * 100) + '%';
        document.getElementById('mana-bar').style.width = (player.mana / player.maxMana * 100) + '%';
        
        // Level/XP
        document.getElementById('level').textContent = gameState.level;
        document.getElementById('xp').textContent = gameState.xp;
        document.getElementById('xp-next').textContent = gameState.level * 100;
        
        // Enemy/NPC counts
        document.getElementById('enemies').textContent = enemies.length;
        document.getElementById('npcs').textContent = npcs.length;
        
        // FPS
        const now = performance.now();
        if (!this.lastTime) this.lastTime = now;
        const delta = now - this.lastTime;
        this.lastTime = now;
        document.getElementById('fps').textContent = Math.round(1000 / delta);
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

class AdvancedPlayer {
    constructor(camera, physics) {
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.rotation = { x: 0, y: 0 };
        this.health = 100;
        this.maxHealth = 100;
        this.mana = 50;
        this.maxMana = 50;
        this.stamina = 100;
        this.attackCooldown = 0;
        this.lastAttackTime = 0;
        this.spellCooldown = 0;
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
        if (!this.isJumping && this.stamina > 20) {
            this.velocity.y = 0.6;
            this.isJumping = true;
            this.stamina -= 20;
            this.createJumpEffect();
        }
    }

    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime > 500) {
            this.lastAttackTime = now;
            this.createAttackEffect();
            this.damageNearbyEnemies();
        }
    }

    damageNearbyEnemies() {
        enemies.forEach(enemy => {
            const distance = this.camera.position.distanceTo(enemy.mesh.position);
            if (distance < 30) {
                enemy.takeDamage(Math.random() * 15 + 10);
                gameState.xp += 10;
                this.createHitEffect(enemy.mesh.position);
            }
        });
    }

    castSpell() {
        if (this.mana >= 20 && Date.now() - this.spellCooldown > 1000) {
            this.mana -= 20;
            this.spellCooldown = Date.now();
            this.createSpellEffect();
            this.damageEnemiesWithSpell();
        }
    }

    damageEnemiesWithSpell() {
        const cameraDir = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDir);
        
        enemies.forEach(enemy => {
            const distance = this.camera.position.distanceTo(enemy.mesh.position);
            if (distance < 80) {
                const angle = Math.acos(cameraDir.dot(enemy.mesh.position.clone().sub(this.camera.position).normalize()));
                if (angle < 0.5) {
                    enemy.takeDamage(Math.random() * 25 + 15);
                    gameState.xp += 15;
                }
            }
        });
    }

    reload() {
        this.mana = this.maxMana;
        this.stamina = 100;
        this.createReloadEffect();
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        this.createHurtEffect();
        if (this.health === 0) {
            console.log('💀 You died!');
            this.health = this.maxHealth;
            this.camera.position.set(0, 5, 15);
        }
    }

    createAttackEffect() {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(2, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff0000 })
        );
        sphere.position.copy(this.camera.position);
        scene.add(sphere);
        setTimeout(() => scene.remove(sphere), 200);
    }

    createSpellEffect() {
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, wireframe: true })
        );
        const cameraDir = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDir);
        cube.position.copy(this.camera.position).addScaledVector(cameraDir, 20);
        scene.add(cube);
        
        const animate = () => {
            cube.position.addScaledVector(cameraDir, 2);
            cube.rotation.x += 0.1;
            cube.rotation.y += 0.1;
            if (cube.position.distanceTo(this.camera.position) > 100) {
                scene.remove(cube);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    createHitEffect(position) {
        const particles = [];
        for (let i = 0; i < 10; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 4, 4),
                new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300 })
            );
            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 1,
                (Math.random() - 0.5) * 2
            );
            scene.add(particle);
            particles.push(particle);
        }
        
        const animate = () => {
            let active = false;
            particles.forEach(p => {
                p.position.add(p.velocity);
                p.velocity.y -= 0.05;
                p.scale.multiplyScalar(0.95);
                if (p.scale.x > 0.1) active = true;
            });
            
            if (active) {
                requestAnimationFrame(animate);
            } else {
                particles.forEach(p => scene.remove(p));
            }
        };
        animate();
    }

    createHurtEffect() {
        const flash = new THREE.Mesh(
            new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
            new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 })
        );
        flash.position.z = -5;
        this.camera.add(flash);
        setTimeout(() => this.camera.remove(flash), 200);
    }

    createJumpEffect() {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(2, 3, 32),
            new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00 })
        );
        ring.position.copy(this.camera.position);
        ring.position.y -= 2.5;
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);
        
        let scale = 1;
        const animate = () => {
            scale += 0.5;
            ring.scale.set(scale, scale, scale);
            ring.material.opacity = 1 - (scale - 1) / 3;
            if (scale < 4) {
                requestAnimationFrame(animate);
            } else {
                scene.remove(ring);
            }
        };
        animate();
    }

    createReloadEffect() {
        showMessage('✨ Restored! ✨');
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
        this.velocity.y -= 0.02;
        this.camera.position.y += this.velocity.y;

        if (this.camera.position.y < 2) {
            this.camera.position.y = 2;
            this.velocity.y = 0;
            this.isJumping = false;
        }
        
        // Regenerate mana and stamina
        this.mana = Math.min(this.maxMana, this.mana + 0.1);
        this.stamina = Math.min(100, this.stamina + 0.2);
    }
}

class AdvancedWorld {
    generate(scene, physics) {
        this.createTerrain(scene, physics);
        this.createForest(scene, physics);
        this.createCaves(scene, physics);
        this.createMagicalStructures(scene);
    }

    createTerrain(scene, physics) {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(800, 800),
            new THREE.MeshStandardMaterial({ color: 0x1a2a0a, roughness: 0.9, metalness: 0 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
    }

    createForest(scene, physics) {
        const treeData = [
            [-100, 0, -150], [100, 0, -150], [-50, 0, -200], [50, 0, -200],
            [-150, 0, 0], [150, 0, 0], [-120, 0, 100], [120, 0, 100],
            [0, 0, -250], [-200, 0, -100], [200, 0, -100], [-180, 0, 150],
            [180, 0, 150], [0, 0, 200], [-250, 0, 0], [250, 0, 0]
        ];

        treeData.forEach(pos => {
            this.createAdvancedTree(scene, pos[0], pos[1], pos[2], physics);
        });
    }

    createAdvancedTree(scene, x, y, z, physics) {
        const height = Math.random() * 4 + 8;
        const trunkRadius = Math.random() * 1 + 1;

        // Trunk with bumps for realism
        for (let i = 0; i < 3; i++) {
            const offset = height / 3 * i;
            const trunkGeometry = new THREE.ConeGeometry(trunkRadius - i * 0.3, height / 3, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.06, 0.5, 0.3),
                roughness: 0.7
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(x, y + offset + height / 6, z);
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            scene.add(trunk);
        }

        // Multi-layer foliage
        for (let i = 0; i < 4; i++) {
            const foliageGeometry = new THREE.IcosahedronGeometry(6 - i * 1, 4);
            const foliageMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.35 + Math.random() * 0.05, 0.6, 0.3 + Math.random() * 0.1),
                roughness: 0.6,
                emissive: new THREE.Color().setHSL(0.35, 0.4, 0.1)
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(x, y + height + 2 + i * 3, z);
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            scene.add(foliage);
        }
    }

    createCaves(scene, physics) {
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * 300;
            const z = (Math.random() - 0.5) * 300;
            const cave = new THREE.Mesh(
                new THREE.SphereGeometry(20, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9, metalness: 0 })
            );
            cave.position.set(x, -15, z);
            cave.scale.set(1, 0.6, 1);
            cave.castShadow = true;
            cave.receiveShadow = true;
            scene.add(cave);
        }
    }

    createMagicalStructures(scene) {
        // Mystical pillars
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const x = Math.cos(angle) * 200;
            const z = Math.sin(angle) * 200;
            
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(3, 3, 30, 32),
                new THREE.MeshStandardMaterial({ 
                    color: new THREE.Color().setHSL(0.7 + i * 0.05, 0.8, 0.4),
                    emissive: new THREE.Color().setHSL(0.7 + i * 0.05, 0.8, 0.2),
                    metalness: 0.6,
                    roughness: 0.4
                })
            );
            pillar.position.set(x, 15, z);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            scene.add(pillar);
            
            // Top orb
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(2, 32, 32),
                new THREE.MeshStandardMaterial({ 
                    color: new THREE.Color().setHSL(0.7 + i * 0.05, 1, 0.5),
                    emissive: new THREE.Color().setHSL(0.7 + i * 0.05, 1, 0.4),
                    metalness: 1,
                    roughness: 0
                })
            );
            orb.position.set(x, 32, z);
            orb.castShadow = true;
            scene.add(orb);
        }
    }
}

class Enemy {
    constructor(x, y, z, type, scene, physics) {
        this.type = type;
        this.scene = scene;
        this.physics = physics;
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 5 + Math.random() * 5;
        this.speed = 0.2 + Math.random() * 0.1;
        this.detectionRange = 100;
        this.lastAttackTime = 0;
        this.targetPlayer = false;
        
        // Create mesh
        this.createMesh(x, y, z, type);
    }

    createMesh(x, y, z, type) {
        const colors = {
            goblin: 0x44aa44,
            skeleton: 0xcccccc,
            troll: 0x886633,
            wraith: 0x7744ff
        };
        
        const geometry = new THREE.BoxGeometry(1.5, 2, 1.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: colors[type] || 0x888888,
            roughness: 0.7,
            emissive: type === 'wraith' ? colors[type] : 0x000000
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    }

    update(playerPos, player) {
        const distance = this.mesh.position.distanceTo(playerPos);
        
        if (distance < this.detectionRange) {
            this.targetPlayer = true;
            const direction = playerPos.clone().sub(this.mesh.position).normalize();
            this.mesh.position.addScaledVector(direction, this.speed);
            
            if (distance < 5 && Date.now() - this.lastAttackTime > 1000) {
                this.lastAttackTime = Date.now();
                player.takeDamage(this.damage);
            }
        } else {
            this.targetPlayer = false;
            this.mesh.position.x += (Math.random() - 0.5) * 0.5;
            this.mesh.position.z += (Math.random() - 0.5) * 0.5;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.scene.remove(this.mesh);
        }
    }
}

class NPC {
    constructor(pos, type, name, scene) {
        this.type = type;
        this.name = name;
        this.scene = scene;
        this.position = pos;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.dialog = this.getDialog();
        
        this.createMesh(type);
    }

    createMesh(type) {
        const colors = {
            merchant: 0xffaa00,
            warrior: 0xff4444,
            mage: 0x4488ff,
            archer: 0x88dd00,
            healer: 0x00ff88,
            rogue: 0x8844ff,
            paladin: 0xffff44,
            sorcerer: 0xff00ff
        };
        
        const geometry = new THREE.ConeGeometry(1, 2.5, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: colors[this.type] || 0xffffff,
            emissive: colors[this.type],
            metalness: 0.3,
            roughness: 0.6
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(...this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Add a name label
        this.createNameLabel();
    }

    createNameLabel() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = 'Bold 40px Arial';
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, 128, 45);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(4, 1);
        const label = new THREE.Mesh(geometry, material);
        label.position.y = 3;
        this.mesh.add(label);
    }

    getDialog() {
        const dialogs = {
            merchant: 'Welcome, traveler! Care to trade?',
            warrior: 'The forest grows darker each day...',
            mage: 'I sense powerful magic here...',
            archer: 'Beware the shadows, friend.',
            healer: 'May the light protect you!',
            rogue: 'Stay in the shadows with me...',
            paladin: 'Evil shall not prevail!',
            sorcerer: 'Dark forces gather...'
        };
        return dialogs[this.type] || 'Hello!';
    }

    update() {
        this.mesh.rotation.y += this.rotationSpeed;
    }
}

function showMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.textContent = text;
    document.getElementById('messages').appendChild(msg);
    setTimeout(() => msg.remove(), 3500);
}

// Initialize game
window.addEventListener('load', () => {
    new AdvancedGame();
    showMessage('⚔️ Welcome to the Dark Forest! ⚔️');
    setTimeout(() => showMessage('🎮 Left Click to Attack | Q to Cast Spell'), 500);
});