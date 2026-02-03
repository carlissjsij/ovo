interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
}

class UTMfy {
  private params: UTMParams = {};
  private clickId: string | null = null;

  constructor() {
    this.captureUTMs();
  }

  private captureUTMs(): void {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        this.params[key] = value;
      }
    });

    const clickId = urlParams.get('click_id') || urlParams.get('clickid');
    if (clickId) {
      this.clickId = clickId;
    }

    if (Object.keys(this.params).length > 0) {
      this.saveToStorage();
    } else {
      this.loadFromStorage();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('utmfy_params', JSON.stringify(this.params));
      if (this.clickId) {
        localStorage.setItem('utmfy_click_id', this.clickId);
      }
    } catch (e) {
      console.error('Error saving UTM params:', e);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('utmfy_params');
      if (stored) {
        this.params = JSON.parse(stored);
      }

      const storedClickId = localStorage.getItem('utmfy_click_id');
      if (storedClickId) {
        this.clickId = storedClickId;
      }
    } catch (e) {
      console.error('Error loading UTM params:', e);
    }
  }

  getParams(): UTMParams {
    return { ...this.params };
  }

  getClickId(): string | null {
    return this.clickId;
  }

  async trackEvent(eventName: string, eventData: Record<string, any> = {}): Promise<void> {
    if (typeof window === 'undefined') return;

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...this.params,
      click_id: this.clickId,
      ...eventData,
    };

    try {
      const response = await fetch('https://api.utmify.com.br/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('UTMfy tracking error:', response.statusText);
      }
    } catch (error) {
      console.error('UTMfy tracking error:', error);
    }
  }

  async trackConversion(conversionData: Record<string, any> = {}): Promise<void> {
    return this.trackEvent('conversion', conversionData);
  }

  async trackPageView(): Promise<void> {
    return this.trackEvent('pageview');
  }
}

export const utmfy = new UTMfy();
