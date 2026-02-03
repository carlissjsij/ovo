export interface FingerprintData {
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string;
  plugins: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  colorDepth: number;
  touchSupport: boolean;
  vendor: string;
  renderer: string;
}

export class BrowserFingerprint {
  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      canvas.width = 200;
      canvas.height = 50;

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('FingerprintJS', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('FingerprintJS', 4, 17);

      return canvas.toDataURL();
    } catch {
      return 'canvas-error';
    }
  }

  private async getWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor}~${renderer}`;
      }
      return 'no-debug-info';
    } catch {
      return 'webgl-error';
    }
  }

  private async getAudioFingerprint(): Promise<string> {
    return 'audio-disabled';
  }

  private async getFontsFingerprint(): Promise<string> {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New',
      'Georgia', 'Palatino', 'Garamond', 'Bookman',
      'Comic Sans MS', 'Trebuchet MS', 'Impact'
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';

    const baselines: { [key: string]: { width: number; height: number } } = {};
    baseFonts.forEach(font => {
      ctx.font = `${testSize} ${font}`;
      const metrics = ctx.measureText(testString);
      baselines[font] = {
        width: metrics.width,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      };
    });

    const detected: string[] = [];
    testFonts.forEach(font => {
      baseFonts.forEach(baseFont => {
        ctx.font = `${testSize} ${font}, ${baseFont}`;
        const metrics = ctx.measureText(testString);
        const current = {
          width: metrics.width,
          height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        };

        if (current.width !== baselines[baseFont].width ||
            current.height !== baselines[baseFont].height) {
          if (!detected.includes(font)) {
            detected.push(font);
          }
        }
      });
    });

    return detected.sort().join(',');
  }

  private getPluginsFingerprint(): string {
    if (!navigator.plugins || navigator.plugins.length === 0) {
      return 'no-plugins';
    }

    const plugins = Array.from(navigator.plugins)
      .map(p => p.name)
      .sort()
      .join(',');

    return plugins || 'no-plugins';
  }

  private getScreenFingerprint(): string {
    return [
      screen.width,
      screen.height,
      screen.availWidth,
      screen.availHeight,
      screen.colorDepth,
      window.devicePixelRatio || 1
    ].join('x');
  }

  async generate(): Promise<FingerprintData> {
    const canvas = await this.getCanvasFingerprint();
    const webgl = await this.getWebGLFingerprint();

    const data: FingerprintData = {
      canvas,
      webgl,
      audio: 'fast-mode',
      fonts: 'fast-mode',
      plugins: this.getPluginsFingerprint(),
      screen: this.getScreenFingerprint(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0,
      colorDepth: screen.colorDepth,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      vendor: navigator.vendor,
      renderer: webgl.split('~')[1] || 'unknown'
    };

    return data;
  }

  async hash(data: FingerprintData): Promise<string> {
    const str = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async get(): Promise<string> {
    const data = await this.generate();
    return this.hash(data);
  }
}

export const fingerprint = new BrowserFingerprint();
