/**
 * Public types for the Flux solver.
 *
 * `FluidConfig` mirrors the generated core exactly — see `core/fluid.core.d.ts`.
 * Everything under "added" was written for this project; the rest is upstream.
 */
export type FluidColor = {
  r: number;
  g: number;
  b: number;
};

export type FluidConfig = {
  /* ---- upstream ---- */
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  CAPTURE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLORFUL: boolean;
  COLOR_UPDATE_SPEED: number;
  PAUSED: boolean;
  BACK_COLOR: FluidColor;
  TRANSPARENT: boolean;
  BLOOM: boolean;
  BLOOM_ITERATIONS: number;
  BLOOM_RESOLUTION: number;
  BLOOM_INTENSITY: number;
  BLOOM_THRESHOLD: number;
  BLOOM_SOFT_KNEE: number;
  SUNRAYS: boolean;
  SUNRAYS_RESOLUTION: number;
  SUNRAYS_WEIGHT: number;

  /* ---- added: particles ---- */
  PARTICLES: boolean;
  PARTICLE_COUNT: number;
  PARTICLE_SIZE: number;
  PARTICLE_LIFE: number;
  PARTICLE_SPEED: number;
  PARTICLE_FADE: number;
  PARTICLE_COLORFUL: boolean;
  PARTICLE_COLOR: FluidColor;

  /* ---- added: palette window ---- */
  COLOR_HUE_MIN: number;
  COLOR_HUE_MAX: number;
  COLOR_SATURATION: number;
  COLOR_VALUE: number;

  /** Seconds between ambient splats; 0 disables them. */
  AUTO_SPLATS: number;

  /** Upper bound applied to devicePixelRatio for the drawing buffer. */
  MAX_PIXEL_RATIO: number;
};

export type FluidInfo = {
  webgl2: boolean;
  linearFiltering: boolean;
  particlesSupported: boolean;
  particles: number;
  sim: { width: number; height: number };
  dye: { width: number; height: number };
};

export type RecordingOptions = {
  fps?: number;
  videoBitsPerSecond?: number;
  onStop?: (url: string) => void;
};

export type ImageSplatOptions = {
  density?: number;
  force?: number;
  brightness?: number;
};

export type FluidSimulation = {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  readonly config: FluidConfig;

  start(): void;
  stop(): void;
  resize(): void;
  dispose(): void;

  setConfig(patch: Partial<FluidConfig>): void;
  randomSplats(amount?: number): void;
  /** Wipe dye and velocity, leaving an empty field. */
  clearField(): void;
  splat(x: number, y: number, dx: number, dy: number, color: FluidColor): void;
  imageSplats(image: CanvasImageSource, options?: ImageSplatOptions): void;

  /** `id` is the pointerId; x / y are CSS pixels relative to the canvas. */
  pointerDown(id: number, x: number, y: number): void;
  pointerMove(id: number, x: number, y: number): void;
  pointerUp(id: number): void;

  screenshot(resolution?: number): void;
  screenshotDataURL(resolution?: number): string;
  startRecording(options?: RecordingOptions): boolean;
  stopRecording(): void;
  isRecording(): boolean;

  fluidInfo(): FluidInfo;
};

export type FluidPreset = {
  id: string;
  name: string;
  group: "house" | "classic" | "signature";
  family: string;
  variant: string;
  config: Partial<FluidConfig>;
};

export type QualityLevel = {
  id: "low" | "medium" | "high" | "ultra";
  name: string;
  note: string;
  config: Partial<FluidConfig>;
};

export type FluidFamily = {
  slug: string;
  name: string;
  group: "house" | "classic";
  /** Hue window in turns, 0–1; may wrap past 1. */
  hue: [number, number];
  saturation: number;
  value: number;
  back: [number, number, number];
  particle: [number, number, number];
  base?: Partial<FluidConfig>;
};

export type FluidVariant = {
  slug: string;
  name: string;
  curl: number;
  force: number;
  density: number;
  bloom: number;
  sunrays: number;
  speed: number;
  particles: number;
  size: number;
};
