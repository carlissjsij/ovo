interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
}

interface UTMfyOrderPayload {
  orderId: string;
  platform: string;
  paymentMethod: 'credit_card' | 'boleto' | 'pix' | 'paypal' | 'free_price';
  status: 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback';
  createdAt: string;
  approvedDate: string | null;
  refundedAt: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    document: string | null;
    country?: string;
    ip?: string;
  };
  products: Array<{
    id: string;
    name: string;
    planId: string | null;
    planName: string | null;
    quantity: number;
    priceInCents: number;
  }>;
  trackingParameters: {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency?: string;
  };
  isTest?: boolean;
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

  async sendOrder(payload: UTMfyOrderPayload): Promise<{ success: boolean; error?: string }> {
    const apiKey = import.meta.env.VITE_UTMFY_API_KEY;

    if (!apiKey) {
      console.error('UTMfy API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('UTMfy API error:', response.status, errorText);
        return { success: false, error: `API error: ${response.status}` };
      }

      const result = await response.json();
      console.log('UTMfy order sent successfully:', result);
      return { success: true };
    } catch (error) {
      console.error('UTMfy sendOrder error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const utmfy = new UTMfy();
