"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { BVHLoader } from "three/examples/jsm/loaders/BVHLoader"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface CanvasProps {
  bvhFile: string | null; // Received BVH filename
}

export default function Canvas({ bvhFile }: CanvasProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  

  useEffect(() => {
    if (!sceneRef.current || !bvhFile) return;
  
    // Create Scene, Camera & Renderer
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xeeeeee);
    scene.background = new THREE.Color( 0xa0a0a0 );
		// scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

		const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
		hemiLight.position.set( 0, 20, 0 );
  	scene.add( hemiLight );
    const gridHelper=new THREE.GridHelper(400, 10);
		gridHelper.position.y = -19;
			// gridHelper.position.x=100
    scene.add(gridHelper);
  
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 200, 300);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight-20);
  
    // **Replace existing canvas if it exists**
    if (sceneRef.current.firstChild) {
      sceneRef.current.removeChild(sceneRef.current.firstChild);
    }
    
    sceneRef.current.appendChild(renderer.domElement);
  
    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 300;
    controls.maxDistance = 700;
  
    // Clock for animation timing
    const clock = new THREE.Clock();
    let mixer: THREE.AnimationMixer | null = null;
    let gltfModel, gltfSkeleton, bvhSkeleton;
    function retargetSkeleton(gltfRootBone, bvhRootBone) {
      // console.log('BVH Skeleton:', bvhRootBone);
      // console.log('GLTF Skeleton:', gltfRootBone);

      gltfRootBone.traverse((gltfBone) => {
          if (gltfBone.isBone) {
              const boneName = gltfBone.name.replace(/^mixamorig/, '');
              const bvhBone = bvhRootBone.getObjectByName(boneName);
              if (bvhBone) {
                          // Apply BVH motion to GLTF character
                          gltfBone.position.copy(bvhBone.position);
                          gltfBone.quaternion.copy(bvhBone.quaternion);
                      }
                  }
              });
    }
  
    // Load BVH file dynamically
    const loader = new BVHLoader();
    loader.load(`/` + bvhFile, (result) => {

      bvhSkeleton = result.skeleton.bones[0];      
      mixer = new THREE.AnimationMixer(bvhSkeleton);
      mixer.clipAction(result.clip).play();

      // Now Load the 3D Character Model
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('/Xbot.glb', function (gltf) {
        gltfModel = gltf.scene;
        
        // // Scale model 100x
        gltfModel.scale.set(100, 100, 100); 
        scene.add(gltfModel);

        // Extract GLTF Skeleton
        gltfSkeleton = new THREE.SkeletonHelper(gltfModel);
        // console.log('GLTF Bone Names:', gltfSkeleton.bones.map(b => b.name));

        // Retarget skeleton initially
        retargetSkeleton(gltfSkeleton.bones[0], bvhSkeleton);
      });

        });
		function applyBVHAnimation(gltfRootBone, bvhRootBone) {
			gltfRootBone.traverse((gltfBone) => {
				if (gltfBone.isBone) {
					const boneName = gltfBone.name.replace(/^mixamorig/, '');
					const bvhBone = bvhRootBone.getObjectByName(boneName);

					if (bvhBone) {
						// Continuously apply BVH transformations to GLB skeleton
						gltfBone.position.lerp(bvhBone.position, 0.5); // Smooth transition
						gltfBone.quaternion.slerp(bvhBone.quaternion, 0.5); // Smooth rotation blending
					}
				}
			});
		}
  
    // Resize handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
  
    window.addEventListener("resize", onWindowResize);
  
    // Animation loop
    const animate = () => {
      const delta = clock.getDelta();
			if (mixer) mixer.update(delta);

			if (gltfSkeleton && bvhSkeleton) {
				applyBVHAnimation(gltfSkeleton.bones[0], bvhSkeleton);
			}

			renderer.render(scene, camera);
			requestAnimationFrame(animate);
    };
  
    animate();
  
    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.dispose();
    };
  }, [bvhFile]); // Reload the effect whenever `bvhFile` changes
   // Reload the effect whenever `bvhFile` changes

  return <div ref={sceneRef} className="h-full bg-gray-100" />;
}
