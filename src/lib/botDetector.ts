export interface BotDetectionResult {
  isBot: boolean;
  isSuspicious: boolean;
  detections: string[];
  score: number;
  details: {
    headless: boolean;
    webdriver: boolean;
    phantom: boolean;
    selenium: boolean;
    suspicious_userAgent: boolean;
    suspicious_plugins: boolean;
    suspicious_languages: boolean;
    suspicious_screen: boolean;
    suspicious_errors: boolean;
    automation_tools: boolean;
    browser_inconsistencies: boolean;
  };
}

export class BotDetector {
  private detections: string[] = [];
  private score: number = 0;

  private checkHeadless(): boolean {
    const w = window as any;

    if (w.navigator.webdriver) {
      this.detections.push('webdriver-present');
      this.score += 20;
      return true;
    }

    if (!w.navigator.plugins || w.navigator.plugins.length === 0) {
      this.detections.push('no-plugins');
      this.score += 5;
    }

    if (!w.navigator.languages || w.navigator.languages.length === 0) {
      this.detections.push('no-languages');
      this.score += 10;
    }

    if (w.chrome && !w.chrome.runtime) {
      this.detections.push('chrome-runtime-missing');
      this.score += 15;
    }

    const chromePresent = !!w.chrome;
    const vendorIsGoogle = navigator.vendor === 'Google Inc.';
    if (chromePresent && !vendorIsGoogle) {
      this.detections.push('vendor-mismatch');
      this.score += 10;
    }

    if (w.document.documentElement.getAttribute('webdriver')) {
      this.detections.push('webdriver-attribute');
      this.score += 20;
      return true;
    }

    return false;
  }

  private checkAutomationTools(): boolean {
    const w = window as any;

    const automationSignals = [
      '__webdriver_evaluate',
      '__selenium_evaluate',
      '__webdriver_script_function',
      '__webdriver_script_func',
      '__webdriver_script_fn',
      '__fxdriver_evaluate',
      '__driver_unwrapped',
      '__webdriver_unwrapped',
      '__driver_evaluate',
      '__selenium_unwrapped',
      '__fxdriver_unwrapped',
      '_Selenium_IDE_Recorder',
      '_selenium',
      'callSelenium',
      'callPhantom',
      '_phantom',
      '__nightmare',
      'emit',
      'spawn',
      'Buffer',
      'domAutomation',
      'domAutomationController'
    ];

    let found = false;
    automationSignals.forEach(signal => {
      if (w[signal] || document[signal as any]) {
        this.detections.push(`automation-${signal}`);
        this.score += 25;
        found = true;
      }
    });

    if (w.document.$cdc_asdjflasutopfhvcZLmcfl_) {
      this.detections.push('chrome-headless-signature');
      this.score += 30;
      found = true;
    }

    if (navigator.webdriver) {
      this.detections.push('navigator-webdriver');
      this.score += 25;
      found = true;
    }

    return found;
  }

  private checkUserAgent(): boolean {
    const ua = navigator.userAgent.toLowerCase();

    const botPatterns = [
      'headless',
      'phantom',
      'selenium',
      'webdriver',
      'bot',
      'crawler',
      'spider',
      'scraper',
      'facebookexternalhit',
      'facebot',
      'twitterbot',
      'whatsapp',
      'telegrambot',
      'slackbot',
      'linkedinbot',
      'pinterestbot',
      'instagrambot',
      'tiktok',
      'bytespider',
      'petalbot'
    ];

    let found = false;
    botPatterns.forEach(pattern => {
      if (ua.includes(pattern)) {
        this.detections.push(`ua-${pattern}`);
        this.score += 30;
        found = true;
      }
    });

    return found;
  }

  private checkBrowserInconsistencies(): boolean {
    let hasInconsistencies = false;

    if (navigator.platform === 'Win32' && !('ActiveXObject' in window) && !('MSStream' in window)) {
      const ua = navigator.userAgent;
      if (ua.includes('Windows')) {
        const hasWin64 = ua.includes('Win64') || ua.includes('WOW64');
        const is64Platform = navigator.platform === 'Win32';
        if (hasWin64 && is64Platform) {
          this.detections.push('platform-inconsistency');
          this.score += 10;
          hasInconsistencies = true;
        }
      }
    }

    if (screen.width === 0 || screen.height === 0) {
      this.detections.push('zero-screen-size');
      this.score += 20;
      hasInconsistencies = true;
    }

    if (screen.colorDepth === 0 || screen.colorDepth === 1) {
      this.detections.push('abnormal-color-depth');
      this.score += 15;
      hasInconsistencies = true;
    }

    const touchPoints = navigator.maxTouchPoints || 0;
    const hasTouch = 'ontouchstart' in window;
    if (touchPoints > 0 && !hasTouch) {
      this.detections.push('touch-inconsistency');
      this.score += 5;
    }

    return hasInconsistencies;
  }

  private checkPermissions(): boolean {
    const w = window as any;

    if (!w.Notification || !w.Notification.permission) {
      this.detections.push('no-notification-api');
      this.score += 5;
      return true;
    }

    return false;
  }

  private checkErrorHandling(): boolean {
    try {
      const testError = new Error('test');
      if (!testError.stack || testError.stack.length < 10) {
        this.detections.push('suspicious-error-stack');
        this.score += 10;
        return true;
      }
    } catch {
      this.detections.push('error-check-failed');
      this.score += 5;
    }

    return false;
  }

  private checkConnectionSpeed(): void {
    const w = window as any;
    if (w.navigator.connection) {
      const connection = w.navigator.connection;
      if (connection.rtt === 0 && connection.downlink === 0) {
        this.detections.push('zero-connection-metrics');
        this.score += 15;
      }
    }
  }

  private checkMimeTypes(): void {
    if (!navigator.mimeTypes || navigator.mimeTypes.length === 0) {
      this.detections.push('no-mime-types');
      this.score += 5;
    }
  }

  async detect(): Promise<BotDetectionResult> {
    this.detections = [];
    this.score = 0;

    const headless = this.checkHeadless();
    const automationTools = this.checkAutomationTools();
    const suspiciousUA = this.checkUserAgent();
    const browserInconsistencies = this.checkBrowserInconsistencies();
    const permissionIssues = this.checkPermissions();
    const errorIssues = this.checkErrorHandling();

    this.checkConnectionSpeed();
    this.checkMimeTypes();

    const isBot = this.score >= 50;
    const isSuspicious = this.score >= 20;

    return {
      isBot,
      isSuspicious,
      detections: this.detections,
      score: this.score,
      details: {
        headless,
        webdriver: navigator.webdriver === true,
        phantom: !!(window as any).callPhantom || !!(window as any)._phantom,
        selenium: !!(window as any).selenium || !!(document as any).selenium,
        suspicious_userAgent: suspiciousUA,
        suspicious_plugins: !navigator.plugins || navigator.plugins.length === 0,
        suspicious_languages: !navigator.languages || navigator.languages.length === 0,
        suspicious_screen: screen.width === 0 || screen.height === 0,
        suspicious_errors: errorIssues,
        automation_tools: automationTools,
        browser_inconsistencies: browserInconsistencies
      }
    };
  }
}

export const botDetector = new BotDetector();
