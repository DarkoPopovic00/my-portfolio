import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import GUI from 'lil-gui';
import * as THREE from 'three';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent implements OnInit {
  private canvas: any;
  private scene: any;
  private cameraGroup: any;
  private camera: any;
  private renderer: any;
  private gui = new GUI();

  private parameters = {
    materialColor: '#ffeded',
  };
  private objectDistance = 4;
  private sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  private cursor = {
    x: 0,
    y: 0,
  };

  private readonly clock = new THREE.Clock();
  private previousTime = 0;
  private particalesMaterial: any;

  constructor() {}

  ngOnInit(): void {
    this.canvas = document.querySelector('canvas.webgl');
    this.scene = new THREE.Scene();

    this.gui.addColor(this.parameters, 'materialColor').onChange(() => {
      this.particalesMaterial.color.set(this.parameters.materialColor)
    });
    this.addLight();
    this.createParticles();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    this.addCamera();
    this.addRenderer();
    this.tick();
  }

  private addRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private addCamera() {
    this.cameraGroup = new THREE.Group();
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.cameraGroup.add(this.camera);
    this.camera.position.z = 6;
    this.scene.add(this.cameraGroup);
  }

  private addLight() {
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.position.set(1, 1, 0);
    this.scene.add(directionalLight);
  }

  private onResize = () => {
    // Update sizes
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private readonly onMouseMove = (event: any) => {
    this.cursor.x = event.clientX / this.sizes.width - 0.5;
    this.cursor.y = event.clientY / this.sizes.height - 0.5;
  };

  private createParticles() {
    const particalCount = 200;
    const positions = new Float32Array(particalCount * 3);
    for (let i = 0; i < particalCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] =
        this.objectDistance * 0.5 - Math.random() * this.objectDistance * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const particalesGeometry = new THREE.BufferGeometry();
    particalesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    //Material
    this.particalesMaterial = new THREE.PointsMaterial({
      color: this.parameters.materialColor,
      size: 0.03,
      sizeAttenuation: true,
    });
    //Points
    const particales = new THREE.Points(particalesGeometry, this.particalesMaterial);
    this.scene.add(particales);
  }

  private readonly tick = () => {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.previousTime;
    this.previousTime = elapsedTime;

    // Animate camera
    this.camera.position.y = (-scrollY / this.sizes.height) * this.objectDistance;

    const parallaxX = this.cursor.x * 0.5;
    const parallaxY = -this.cursor.y * 0.5;
    this.cameraGroup.position.x +=
      (parallaxX - this.cameraGroup.position.x) * 5 * deltaTime;
      this.cameraGroup.position.y +=
      (parallaxY - this.cameraGroup.position.y) * 5 * deltaTime;

    // Render
    this.renderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(this.tick);
  };
}
