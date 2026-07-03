
  // ---- 12. Skills Physics Bubble Simulation ----
  const initSkillsPhysics = () => {
    const containers = document.querySelectorAll('#programming-languages-section .skills-list');
    const skillsContainer = document.querySelector('#programming-languages-section .skills-container');
    if (!containers.length || !skillsContainer || typeof Matter === 'undefined') return;

    // Convert containers NodeList to Array for indexOf-based grouping
    const containerArr = Array.from(containers);

    // Immediate parsing of skills and hiding of fallback static grids during script load
    const parsedGroups = containerArr.map(container => {
      const grid = container.querySelector('.skills-grid');
      if (!grid) return null;

      const skillElements = grid.querySelectorAll('.skill');
      const skills = Array.from(skillElements).map(el => {
        const iconEl = el.querySelector('i');
        return {
          name: el.textContent.trim(),
          iconClass: iconEl ? iconEl.className : ''
        };
      });

      // Hide static grid fallback immediately
      grid.style.display = 'none';

      return skills;
    });

    const iconMap = {
      'fab fa-python': { char: '\uf3e2', family: '"Font Awesome 5 Brands"' },
      'fab fa-java': { char: '\uf4e4', family: '"Font Awesome 5 Brands"' },
      'fab fa-html5': { char: '\uf13b', family: '"Font Awesome 5 Brands"' },
      'fab fa-css3-alt': { char: '\uf38b', family: '"Font Awesome 5 Brands"' },
      'fab fa-js': { char: '\uf3b8', family: '"Font Awesome 5 Brands"' },
      'fab fa-react': { char: '\uf41b', family: '"Font Awesome 5 Brands"' },
      'fab fa-bootstrap': { char: '\uf836', family: '"Font Awesome 5 Brands"' },
      'fab fa-node-js': { char: '\uf3d3', family: '"Font Awesome 5 Brands"' },
      'fab fa-php': { char: '\uf457', family: '"Font Awesome 5 Brands"' },
      'fab fa-whatsapp': { char: '\uf40c', family: '"Font Awesome 5 Brands"' },
      'fab fa-github': { char: '\uf09b', family: '"Font Awesome 5 Brands"' },
      'fab fa-linkedin': { char: '\uf082', family: '"Font Awesome 5 Brands"' },
      'fab fa-instagram': { char: '\uf16d', family: '"Font Awesome 5 Brands"' },
      'fab fa-snapchat': { char: '\uf2ad', family: '"Font Awesome 5 Brands"' },
      'fab fa-discord': { char: '\uf392', family: '"Font Awesome 5 Brands"' },
      'fas fa-code': { char: '\uf121', family: '"Font Awesome 5 Free"' },
      'fas fa-database': { char: '\uf1c0', family: '"Font Awesome 5 Free"' },
      'fas fa-brain': { char: '\uf5dc', family: '"Font Awesome 5 Free"' },
      'fas fa-terminal': { char: '\uf120', family: '"Font Awesome 5 Free"' },
      'fas fa-flask': { char: '\uf0c3', family: '"Font Awesome 5 Free"' },
      'fas fa-bolt': { char: '\uf0e7', family: '"Font Awesome 5 Free"' },
      'fas fa-cube': { char: '\uf1b2', family: '"Font Awesome 5 Free"' },
      'fas fa-plug': { char: '\uf1e6', family: '"Font Awesome 5 Free"' },
      'fas fa-microchip': { char: '\uf2db', family: '"Font Awesome 5 Free"' },
      'fas fa-square-root-alt': { char: '\uf697', family: '"Font Awesome 5 Free"' },
      'fas fa-table': { char: '\uf0ce', family: '"Font Awesome 5 Free"' },
      'fas fa-fire': { char: '\uf06d', family: '"Font Awesome 5 Free"' },
      'fas fa-paint-brush': { char: '\uf1fc', family: '"Font Awesome 5 Free"' },
      'fas fa-feather-alt': { char: '\uf56b', family: '"Font Awesome 5 Free"' },
      'fas fa-gamepad': { char: '\uf11b', family: '"Font Awesome 5 Free"' },
      'fas fa-window-maximize': { char: '\uf2d0', family: '"Font Awesome 5 Free"' },
      'fas fa-camera': { char: '\uf030', family: '"Font Awesome 5 Free"' }
    };

    // Devicon mapping and preload store are defined in DOMContentLoaded outer scope

    let activeEngine = null;
    let canvasContainer = null;
    let animId = null;
    let wakeUpActiveSimulation = null;
    let isCanvasVisible = true;

    function destroySimulation() {
      if (animId) {
        cancelAnimationFrame(animId);
        clearTimeout(animId);
        animId = null;
      }
      if (activeEngine) {
        Matter.World.clear(activeEngine.world);
        Matter.Engine.clear(activeEngine);
        activeEngine = null;
      }
      if (canvasContainer && canvasContainer.parentNode) {
        canvasContainer.parentNode.removeChild(canvasContainer);
        canvasContainer = null;
      }
      wakeUpActiveSimulation = null;
    }

    function createSimulation() {
      // ── GPU / performance telemetry ──────────────────────────────────────────
      let cohesionFrameSkip = 0;   // toggles O(n²) loop every other frame
      let anchorCacheAge     = 999; // force refresh on first frame
      const ANCHOR_TTL       = 10; // refresh anchor rects every N physics steps
      let cachedGroupAnchors = {};
      let physicsAccum       = 0;  // fixed-timestep accumulator (ms)
      const FIXED_STEP       = 1000 / 60; // 16.667 ms
      // ────────────────────────────────────────────────────────────────────────
      destroySimulation();

      // Create a single global canvas container inside the main skills section container
      canvasContainer = document.createElement('div');
      canvasContainer.className = 'physics-canvas-container global-physics-canvas';
      skillsContainer.appendChild(canvasContainer);

      const physCanvas = document.createElement('canvas');
      // GPU layer promotion – compositor can rasterise this on GPU
      physCanvas.style.willChange = 'transform';
      physCanvas.style.transform  = 'translateZ(0)';
      canvasContainer.appendChild(physCanvas);

      // Try OffscreenCanvas for off-main-thread rendering (Chrome/Edge ≥ 69)
      let ctx;
      let offscreen = null;
      let offCtx    = null;
      const supportsOffscreen = (typeof OffscreenCanvas !== 'undefined') &&
                                (typeof physCanvas.transferControlToOffscreen === 'function');
      if (supportsOffscreen) {
        try {
          offscreen = physCanvas.transferControlToOffscreen();
          offCtx    = offscreen.getContext('2d');
          ctx       = offCtx; // use offscreen context for all drawing
        } catch(e) {
          ctx = physCanvas.getContext('2d', { alpha: true });
        }
      } else {
        ctx = physCanvas.getContext('2d', { alpha: true });
      }

      let width  = skillsContainer.clientWidth  || 800;
      let height = skillsContainer.clientHeight || 700;

      // Set canvas logical size on the right object
      if (offscreen) {
        offscreen.width  = width;
        offscreen.height = height;
      } else {
        physCanvas.width  = width;
        physCanvas.height = height;
      }

      // Determine ball radius 'r' based on screen width for absolute responsiveness
      const screenWidth = window.innerWidth;
      let r = 45;
      if (screenWidth < 360) {
        r = 18; // Super small screens (e.g. iPhone SE / folding phones)
      } else if (screenWidth < 415) {
        r = 22; // Small mobile screens
      } else if (screenWidth < 500) {
        r = 26; // Large mobile screens
      } else if (screenWidth < 768) {
        r = 32; // Tablets
      } else if (screenWidth < 1024) {
        r = 38; // Laptops
      }

      // Mass scaling factor to ensure gravity/forces behave identically regardless of ball size
      const massFactor = (r / 45) * (r / 45);

      // Matter.js Engine setup (zero gravity fluid space)
      const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
      activeEngine = engine;
      const world = engine.world;

      const wallThickness = 60;
      const walls = [
        Matter.Bodies.rectangle(width / 2, -wallThickness / 2, 10000, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, 10000, wallThickness, { isStatic: true }),
        Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, 10000, { isStatic: true }),
        Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, 10000, { isStatic: true })
      ];
      Matter.Composite.add(world, walls);

      const bodies = [];
      let cursorBody = null;
      let simulationStarted = false;

      // Track mouse position manually for repulsion (works even without Matter.Mouse)
      let liveMouse = { x: -9999, y: -9999, active: false };
      let isMouseDown = false;

      // Shared render/physics cache (accessible by both setupForceEvents and render)
      let cachedCanvasRect = null;
      let hoverQueryTick   = 0;

      // Rare Event States
      let rareEventTimer    = 0;
      let rareEventActive   = false;
      let rareEventType     = '';
      let rareEventProgress = 0;

      physCanvas.addEventListener('mousemove', (e) => {
        const rect = cachedCanvasRect || physCanvas.getBoundingClientRect();
        liveMouse.x = e.clientX - rect.left;
        liveMouse.y = e.clientY - rect.top;
        liveMouse.active = true;
      });
      physCanvas.addEventListener('mouseleave', () => {
        liveMouse.active = false;
        liveMouse.x = -9999;
        liveMouse.y = -9999;
        isMouseDown = false;
      });
      physCanvas.addEventListener('mousedown', () => {
        isMouseDown = true;
      });
      window.addEventListener('mouseup', () => {
        isMouseDown = false;
      });

      // Touch support — swipe repels (like hover), does not attract
      physCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isMouseDown = false;
        const rect = cachedCanvasRect || physCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        liveMouse.x = touch.clientX - rect.left;
        liveMouse.y = touch.clientY - rect.top;
        liveMouse.active = true;
      }, { passive: false });
      physCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        isMouseDown = false;
        const rect = cachedCanvasRect || physCanvas.getBoundingClientRect();
        const touch = e.touches[0];
        liveMouse.x = touch.clientX - rect.left;
        liveMouse.y = touch.clientY - rect.top;
        liveMouse.active = true;
      }, { passive: false });
      physCanvas.addEventListener('touchend', () => {
        isMouseDown = false;
        liveMouse.active = false;
        liveMouse.x = -9999;
        liveMouse.y = -9999;
      });

      // Delayed initialization function triggered when Skills container is visible
      function startSimulation() {
        // Re-evaluate boundaries with actual rendered width/height
        width  = skillsContainer.clientWidth  || 800;
        height = skillsContainer.clientHeight || 700;
        if (offscreen) {
          offscreen.width  = width;
          offscreen.height = height;
        } else {
          physCanvas.width  = width;
          physCanvas.height = height;
        }

        Matter.Body.setPosition(walls[0], { x: width / 2, y: -wallThickness / 2 });
        Matter.Body.setPosition(walls[1], { x: width / 2, y: height + wallThickness / 2 });
        Matter.Body.setPosition(walls[2], { x: -wallThickness / 2, y: height / 2 });
        Matter.Body.setPosition(walls[3], { x: width + wallThickness / 2, y: height / 2 });

        // Prime the cached canvas rect so the first anchor calculation is correct
        cachedCanvasRect = physCanvas.getBoundingClientRect();

        containerArr.forEach((container, groupIndex) => {
          const skills = parsedGroups[groupIndex];
          if (!skills) return;

          skills.forEach(skill => {
            // Spawn along a random canvas edge (0: Top, 1: Right, 2: Bottom, 3: Left)
            let x, y;
            const edge = Math.floor(Math.random() * 4);
            const margin = r + 15;

            if (edge === 0) {
              x = Math.random() * (width - 2 * margin) + margin;
              y = margin;
            } else if (edge === 1) {
              x = width - margin;
              y = Math.random() * (height - 2 * margin) + margin;
            } else if (edge === 2) {
              x = Math.random() * (width - 2 * margin) + margin;
              y = height - margin;
            } else {
              x = margin;
              y = Math.random() * (height - 2 * margin) + margin;
            }

            const body = Matter.Bodies.circle(x, y, r, {
              restitution: 0.45,
              friction: 0.05,
              frictionAir: 0.04,
              label: skill.name,
              collisionFilter: {
                category: 0x0001,
                mask: 0xFFFFFFFF,
                group: 0
              },
              plugin: {
                skillData: skill,
                radius: r,
                groupIndex: groupIndex,       // Integer group ID for fast comparison
                cardElement: container,        // Keep DOM reference for live rect calculation
                // 3D properties
                zOffset: Math.random() * Math.PI * 2,
                zSpeed: 0.005 + Math.random() * 0.007,
                zVal: 0.0,
                angleOffset: Math.random() * Math.PI * 2
              }
            });
            bodies.push(body);
          });
        });

        Matter.Composite.add(world, bodies);

        // Create an invisible kinematic cursor body that acts as a physical obstacle
        cursorBody = Matter.Bodies.circle(-9999, -9999, r * 0.55, {
          isStatic: true,
          restitution: 0.6,
          friction: 0.0,
          label: 'cursorBody',
          collisionFilter: { group: 0, category: 0x0002, mask: 0xFFFF },
          render: { visible: false }
        });
        Matter.Composite.add(world, cursorBody);

        setupForceEvents();
      }

      function setupForceEvents() {
        // Collision Start event listener for squish impact and chain reactions
        Matter.Events.on(engine, 'collisionStart', (event) => {
          event.pairs.forEach(pair => {
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            if (bodyA && bodyB && bodyA.plugin && bodyB.plugin) {
              const dx = bodyB.position.x - bodyA.position.x;
              const dy = bodyB.position.y - bodyA.position.y;
              const relativeSpeed = Math.sqrt(
                (bodyB.velocity.x - bodyA.velocity.x) * (bodyB.velocity.x - bodyA.velocity.x) +
                (bodyB.velocity.y - bodyA.velocity.y) * (bodyB.velocity.y - bodyA.velocity.y)
              );
              
              if (relativeSpeed > 0.3) {
                const impactForce = Math.min(1.0, relativeSpeed * 0.15);
                const angle = Math.atan2(dy, dx);
                
                bodyA.plugin.wiggle = (bodyA.plugin.wiggle || 0) + impactForce;
                bodyA.plugin.collisionAngle = angle;
                
                bodyB.plugin.wiggle = (bodyB.plugin.wiggle || 0) + impactForce;
                bodyB.plugin.collisionAngle = angle + Math.PI;

                // Propagate chain reaction to group members
                propagateChainReaction(bodyA, impactForce * 0.65);
                propagateChainReaction(bodyB, impactForce * 0.65);
              }
            }
          });
        });

        function propagateChainReaction(sourceBody, energy) {
          if (energy < 0.04) return;
          bodies.forEach(other => {
            if (other !== sourceBody && other.plugin.groupIndex === sourceBody.plugin.groupIndex) {
              const dx = other.position.x - sourceBody.position.x;
              const dy = other.position.y - sourceBody.position.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const limit = sourceBody.plugin.radius * 4.5;
              if (dist < limit) {
                const ratio = dist / limit;
                const receivedEnergy = energy * Math.exp(-ratio * 2.2);
                if (receivedEnergy > 0.02) {
                  other.plugin.wiggle = (other.plugin.wiggle || 0) + receivedEnergy;
                  other.plugin.collisionAngle = Math.atan2(dy, dx);
                }
              }
            }
          });
        }



        // Setup beforeUpdate event handler
        Matter.Events.on(engine, 'beforeUpdate', () => {
          // ── Cursor body ───────────────────────────────────────────────────────
          if (cursorBody) {
            if (liveMouse.active) {
              Matter.Body.setPosition(cursorBody, { x: liveMouse.x, y: liveMouse.y });
            } else {
              Matter.Body.setPosition(cursorBody, { x: -9999, y: -9999 });
            }
          }

          // ── Anchor refresh (throttled – avoids layout thrash every step) ──────
          anchorCacheAge++;
          if (anchorCacheAge >= ANCHOR_TTL) {
            anchorCacheAge = 0;
            if (!cachedCanvasRect) cachedCanvasRect = physCanvas.getBoundingClientRect();
            containerArr.forEach((container, idx) => {
              const cardRect = container.getBoundingClientRect();
              cachedGroupAnchors[idx] = {
                x: (cardRect.left - cachedCanvasRect.left) + cardRect.width  / 2,
                y: (cardRect.top  - cachedCanvasRect.top)  + cardRect.height / 2
              };
            });
          }
          const groupAnchors = cachedGroupAnchors;

          // ── Group centroids (needed every step for cohesion) ──────────────────
          const groupCentroids = {};
          const groupCounts    = {};
          const bodyCount      = bodies.length;
          for (let bi = 0; bi < bodyCount; bi++) {
            const body = bodies[bi];
            const gIdx = body.plugin.groupIndex;
            if (!groupCentroids[gIdx]) {
              groupCentroids[gIdx] = { x: 0, y: 0 };
              groupCounts[gIdx]    = 0;
            }
            groupCentroids[gIdx].x += body.position.x;
            groupCentroids[gIdx].y += body.position.y;
            groupCounts[gIdx]++;
          }
          const centroidKeys = Object.keys(groupCentroids);
          for (let ki = 0; ki < centroidKeys.length; ki++) {
            const gIdx = centroidKeys[ki];
            const cnt  = groupCounts[gIdx];
            groupCentroids[gIdx].x /= cnt;
            groupCentroids[gIdx].y /= cnt;
          }

          // ── Hover query – throttled to every 3rd physics step ────────────────
          hoverQueryTick++;
          if (hoverQueryTick >= 3) {
            hoverQueryTick = 0;
            if (liveMouse.active) {
              const mousePoint = { x: liveMouse.x, y: liveMouse.y };
              const hit = Matter.Query.point(bodies, mousePoint);
              if (hit.length > 0) {
                physCanvas.classList.add('physics-hover');
              } else {
                physCanvas.classList.remove('physics-hover');
              }
            } else {
              physCanvas.classList.remove('physics-hover');
            }
          }

          // 1. Per-body forces
          bodies.forEach((body, idx) => {
            const gIdx = body.plugin.groupIndex;
            const anchor = groupAnchors[gIdx];
            if (!anchor) return;

            const depthMultiplier = 1.0 + 0.3 * (body.plugin.zVal || 0);

            // Elastic Cluster Blob Force:
            // Find group centroid
            const centroid = groupCentroids[gIdx];
            if (centroid) {
              // Centroid pulls to anchor
              const adx = anchor.x - centroid.x;
              const ady = anchor.y - centroid.y;
              const adist = Math.sqrt(adx*adx + ady*ady);
              
              if (adist > 2) {
                const basePull = 0.0011;
                const distPull = 0.000045 * adist;
                const groupPullForce = (basePull + distPull) * massFactor * depthMultiplier;
                
                // Distribute centroid steering force to all members
                Matter.Body.applyForce(body, body.position, {
                  x: (adx / adist) * groupPullForce,
                  y: (ady / adist) * groupPullForce * 1.2
                });
              }

              // Body pulls to its group centroid (Cohesion Blob)
              const cdx = centroid.x - body.position.x;
              const cdy = centroid.y - body.position.y;
              const cdist = Math.sqrt(cdx*cdx + cdy*cdy);
              if (cdist > 2) {
                const cohesionForce = 0.00065 * massFactor * depthMultiplier;
                Matter.Body.applyForce(body, body.position, {
                  x: (cdx / cdist) * cohesionForce,
                  y: (cdy / cdist) * cohesionForce
                });
              }
            }

            // Organic antigravity floating drift
            const time = frameCount * 0.008;
            const driftPhase = body.plugin.zOffset;
            const groupPhase = gIdx * 1.7;
            const driftX = Math.sin(time * 0.7 + driftPhase + groupPhase) * 0.00004 * massFactor * depthMultiplier;
            const driftY = Math.cos(time * 0.5 + driftPhase * 1.3 + groupPhase) * 0.00005 * massFactor * depthMultiplier;
            Matter.Body.applyForce(body, body.position, { x: driftX, y: driftY });

            // Smooth depth-aware damping
            const damping = 0.94 + 0.025 * ((body.plugin.zVal || 0) + 1.0) / 2.0;
            Matter.Body.setVelocity(body, {
              x: body.velocity.x * damping,
              y: body.velocity.y * damping
            });

            // Rare Events: Orbit Storm
            if (rareEventActive && rareEventType === 'orbit' && centroid) {
              const odx = body.position.x - centroid.x;
              const ody = body.position.y - centroid.y;
              const odist = Math.sqrt(odx*odx + ody*ody);
              if (odist > 5) {
                const tx = -ody / odist;
                const ty = odx / odist;
                const orbitForce = 0.00045 * massFactor * depthMultiplier;
                Matter.Body.applyForce(body, body.position, {
                  x: tx * orbitForce,
                  y: ty * orbitForce
                });
              }
            }

            // Rare Events: Radial Shuffle (Outward blast at start of event)
            if (rareEventActive && rareEventType === 'shuffle' && rareEventProgress < 40 && centroid) {
              const odx = body.position.x - centroid.x;
              const ody = body.position.y - centroid.y;
              const odist = Math.sqrt(odx*odx + ody*ody);
              if (odist > 2) {
                const blastSpeed = 0.06 * massFactor * depthMultiplier;
                Matter.Body.setVelocity(body, {
                  x: body.velocity.x + (odx / odist) * blastSpeed,
                  y: body.velocity.y + (ody / odist) * blastSpeed
                });
              }
            }

            // Magnetic Hover Attraction/Repulsion Equilibrium
            if (liveMouse.active) {
              const mdx = body.position.x - liveMouse.x;
              const mdy = body.position.y - liveMouse.y;
              const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

              if (isMouseDown) {
                // Attraction Force
                const pullRadius = r * 7.0;
                if (mDist < pullRadius && mDist > 3) {
                  const pullStrength = (pullRadius - mDist) / pullRadius;
                  const pullForce = Math.pow(pullStrength, 1.5) * 0.0022 * massFactor * depthMultiplier;
                  Matter.Body.applyForce(body, body.position, {
                    x: -(mdx / mDist) * pullForce * body.mass,
                    y: -(mdy / mDist) * pullForce * body.mass
                  });
                }
              } else {
                // Magnetic equilibrium ring force
                const equilibriumDistance = r * 2.2;
                const activeRadius = r * 5.5;
                
                if (mDist < activeRadius && mDist > 2) {
                  const distDelta = mDist - equilibriumDistance;
                  let force = 0;
                  if (distDelta < 0) {
                    // Inside equilibrium: strong repulsion
                    const t = -distDelta / equilibriumDistance;
                    force = t * 0.0016 * massFactor * depthMultiplier;
                  } else {
                    // Outside equilibrium: gentle attraction
                    const t = distDelta / (activeRadius - equilibriumDistance);
                    force = -t * 0.00065 * massFactor * depthMultiplier;
                  }
                  Matter.Body.applyForce(body, body.position, {
                    x: (mdx / mDist) * force,
                    y: (mdy / mDist) * force
                  });
                }
              }
            }
          });

          // 2. Inter-body cohesion – O(n²) throttled to every 2nd physics step
          cohesionFrameSkip = (cohesionFrameSkip + 1) % 2;
          if (cohesionFrameSkip === 0) {
            for (let i = 0; i < bodyCount; i++) {
              const bodyA = bodies[i];
              const gIdxA = bodyA.plugin.groupIndex;
              const breathingScale = 1.0 + 0.15 * Math.sin(frameCount * 0.015 + gIdxA * 1.5);
              const posAx = bodyA.position.x;
              const posAy = bodyA.position.y;

              for (let j = i + 1; j < bodyCount; j++) {
                const bodyB = bodies[j];
                if (bodyA.plugin.groupIndex !== bodyB.plugin.groupIndex) continue;

                const mdx  = bodyB.position.x - posAx;
                const mdy  = bodyB.position.y - posAy;
                const dist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (dist < 3) continue;

                const cohesionForce = (0.00032 + 0.0000075 * dist) * massFactor * breathingScale;
                const invDist = 1 / dist;
                const fx = mdx * invDist * cohesionForce;
                const fy = mdy * invDist * cohesionForce;

                Matter.Body.applyForce(bodyA, bodyA.position, { x:  fx, y:  fy });
                Matter.Body.applyForce(bodyB, bodyB.position, { x: -fx, y: -fy });
              }
            }
          }
        });
      }

      // Animation render loop – fixed physics timestep accumulator
      let isTimeoutActive = false;
      let frameCount      = 0;
      let lastTime        = performance.now();
      // Reusable sort array – avoid per-frame allocation
      const sortedBodiesArr = [];

      function render() {
        isTimeoutActive = false;
        if (physCanvas.offsetParent === null || !isCanvasVisible) {
          isTimeoutActive = true;
          animId = setTimeout(render, 250);
          return;
        }

        const now = performance.now();
        let delta = now - lastTime;
        lastTime  = now;
        // Clamp to avoid spiral of death after tab sleep
        if (delta > 100) delta = FIXED_STEP;

        // Refresh canvas rect once per render frame (not per physics step)
        cachedCanvasRect = physCanvas.getBoundingClientRect();

        if (!simulationStarted) {
          startSimulation();
          simulationStarted = true;
        }



        // Update Rare Event states
        rareEventTimer += delta;
        if (rareEventTimer > 25000) {
          rareEventTimer = 0;
          rareEventActive = true;
          rareEventType = Math.random() > 0.5 ? 'orbit' : 'shuffle';
          rareEventProgress = 0;
        }

        if (rareEventActive) {
          rareEventProgress += delta;
          if (rareEventProgress > 6000) {
            rareEventActive = false;
            rareEventType = '';
          }
        }

        frameCount++;
        ctx.clearRect(0, 0, width, height);

        // Update 3D oscillation values & decay wiggle
        bodies.forEach(body => {
          // Decay wiggle
          if (body.plugin.wiggle > 0.01) {
            body.plugin.wiggle *= 0.88;
          } else {
            body.plugin.wiggle = 0;
          }

          // Hover Lift Elevation
          let isHovered = false;
          if (liveMouse.active) {
            const mdx = body.position.x - liveMouse.x;
            const mdy = body.position.y - liveMouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < body.plugin.radius * 1.1) {
              isHovered = true;
            }
          }
          body.plugin.isHovered = isHovered;

          const baseZ = Math.sin(frameCount * body.plugin.zSpeed + body.plugin.zOffset);
          const targetZ = isHovered ? 1.4 : baseZ;
          body.plugin.zVal = body.plugin.zVal || 0;
          body.plugin.zVal += (targetZ - body.plugin.zVal) * 0.08;

          if (!body.plugin.orientation) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            body.plugin.orientation = {
              x: Math.sin(phi) * Math.cos(theta),
              y: Math.sin(phi) * Math.sin(theta),
              z: Math.cos(phi)
            };
          }

          const autoYaw = 0.003 + (body.plugin.zSpeed || 0.005) * 0.5;
          const autoPitch = 0.002 + (body.plugin.zSpeed || 0.005) * 0.3;
          const autoRoll = 0.001 + (body.plugin.zSpeed || 0.005) * 0.2;

          const vx = Math.max(-15, Math.min(15, body.velocity.x));
          const vy = Math.max(-15, Math.min(15, body.velocity.y));
          const dYaw = vx * 0.025 + autoYaw;
          const dPitch = -vy * 0.025 + autoPitch;
          const dRoll = body.angularVelocity + autoRoll;

          const o = body.plugin.orientation;
          const cosY = Math.cos(dYaw);
          const sinY = Math.sin(dYaw);
          const x1 = o.x * cosY + o.z * sinY;
          const z1 = -o.x * sinY + o.z * cosY;
          const y1 = o.y;

          const cosX = Math.cos(dPitch);
          const sinX = Math.sin(dPitch);
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;
          const x2 = x1;

          const cosZ = Math.cos(dRoll);
          const sinZ = Math.sin(dRoll);
          const x3 = x2 * cosZ - y2 * sinZ;
          const y3 = x2 * sinZ + y2 * cosZ;
          const z3 = z2;

          const len = Math.sqrt(x3 * x3 + y3 * y3 + z3 * z3);
          if (len === 0) {
            body.plugin.orientation = { x: 0, y: 0, z: 1 };
          } else {
            body.plugin.orientation = { x: x3 / len, y: y3 / len, z: z3 / len };
          }
        });

        // Painters algorithm sort – reuse pre-allocated array
        sortedBodiesArr.length = 0;
        for (let si = 0; si < bodies.length; si++) sortedBodiesArr.push(bodies[si]);
        sortedBodiesArr.sort((a, b) => a.plugin.zVal - b.plugin.zVal);
        const sortedBodies = sortedBodiesArr;

        // Draw glossy 3D spheres
        sortedBodies.forEach(body => {
          const z = body.plugin.zVal;
          const bodyRadius = body.plugin.radius;
          const skill = body.plugin.skillData;

          const scale = 1.0 + 0.12 * z;
          const visualRadius = bodyRadius * scale;
          const centerX = width / 2;
          const centerY = height / 2;

          let rx = centerX + (body.position.x - centerX) * scale;
          let ry = centerY + (body.position.y - centerY) * scale;

          rx = Math.max(visualRadius + 2, Math.min(width - visualRadius - 2, rx));
          ry = Math.max(visualRadius + 2, Math.min(height - visualRadius - 2, ry));

          ctx.save();

          const isLight = document.documentElement.getAttribute('data-theme') === 'light';

          // Apply squish/rotation deformation at the translated origin of the sphere
          let squishAmt = 0;
          if (body.plugin.wiggle > 0.01) {
            squishAmt = body.plugin.wiggle * 0.18 * Math.sin(frameCount * 0.85);
            squishAmt = Math.max(-0.35, Math.min(0.35, squishAmt));
          }

          ctx.translate(rx, ry);
          if (body.plugin.wiggle > 0.01 && body.plugin.collisionAngle !== undefined) {
            ctx.rotate(body.plugin.collisionAngle);
          }
          ctx.scale(1.0 - squishAmt, 1.0 + squishAmt);

          // Optimized vector shadow (100x faster than shadowBlur Gaussian filter)
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 6 * scale, visualRadius, 0, Math.PI * 2);
          ctx.fill();

          // Body background
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          const drawFace = (nx, ny, nz) => {
            if (nz <= 0) return;

            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
            ctx.clip();

            const displacementFactor = 0.82;
            const lx = nx * visualRadius * displacementFactor;
            const ly = ny * visualRadius * displacementFactor;

            ctx.translate(lx, ly);

            const radialAngle = Math.atan2(ny, nx);
            ctx.rotate(radialAngle);
            ctx.scale(nz, 1.0);

            const baseAngle = body.angle + body.plugin.angleOffset;
            ctx.rotate(-radialAngle + baseAngle);

            // Proportional sizes/offsets relative to visualRadius
            if (loadedImages[skill.name]) {
              const imgSize = visualRadius * 0.82;
              const imgOffset = -visualRadius * 0.11;
              ctx.drawImage(loadedImages[skill.name], -imgSize / 2, -imgSize / 2 + imgOffset, imgSize, imgSize);
            } else {
              const iconInfo = iconMap[skill.iconClass];
              if (iconInfo) {
                const iconSize = visualRadius * 0.40;
                const iconOffset = -visualRadius * 0.22;
                ctx.font = `900 ${iconSize}px ${iconInfo.family}`;
                ctx.fillStyle = '#1e1e24';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(iconInfo.char, 0, iconOffset);
              }
            }

            // Draw text label proportionally scaled
            const fontSize = Math.max(7.5, visualRadius * 0.20);
            const textOffset = visualRadius * 0.33;
            ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
            ctx.fillStyle = '#1e1e24';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill.name, 0, textOffset);

            // Shading overlay matching curvature
            ctx.save();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * (1 - nz)})`;
            const overlaySize = visualRadius * 1.5;
            ctx.fillRect(-overlaySize / 2, -overlaySize / 2, overlaySize, overlaySize);
            ctx.restore();

            ctx.restore();
          };

          const o = body.plugin.orientation;
          drawFace(-o.x, -o.y, -o.z);
          drawFace(o.x, o.y, o.z);

          // 3D glossy light gradient overlay
          const grad = ctx.createRadialGradient(
            -visualRadius * 0.35, -visualRadius * 0.35, visualRadius * 0.05,
            0, 0, visualRadius
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
          grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.0)');
          grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.0)');
          grad.addColorStop(0.9, 'rgba(0, 0, 0, 0.25)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        // Fixed-timestep physics integration
        physicsAccum += delta;
        let physSteps = 0;
        while (physicsAccum >= FIXED_STEP && physSteps < 3) {
          Matter.Engine.update(engine, FIXED_STEP);
          physicsAccum -= FIXED_STEP;
          physSteps++;
        }
        // Carry excess (don't reset to 0 to preserve sub-step accuracy)
        animId = requestAnimationFrame(render);
      }

      render();

      wakeUpActiveSimulation = () => {
        if (isTimeoutActive) {
          clearTimeout(animId);
          render();
        }
      };
    }

    createSimulation();

    // Debounced resize recreate simulation to fit updated client layout perfectly
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        createSimulation();
      }, 150);
    };
    window.addEventListener('resize', handleResize);

    // Tab change instant wake up
    window.addEventListener('skills-tab-change', () => {
      if (wakeUpActiveSimulation) {
        wakeUpActiveSimulation();
      }
    });

    // Intersection Observer to pause/resume simulation when off-screen
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isCanvasVisible = entry.isIntersecting;
          if (isCanvasVisible && wakeUpActiveSimulation) {
            wakeUpActiveSimulation();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(skillsContainer);
    }
  };

  initSkillsPhysics();
