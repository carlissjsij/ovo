const _0x9d4e = import.meta.env.VITE_SUPABASE_URL;

interface DomainValidationResponse {
  valid: boolean;
  token?: string;
  redirect?: string;
  reason?: string;
}

class AntiCloneProtection {
  private _0x1a2b: string | null = null;
  private _0x3c4d: number = 0;
  private _0x5e6f: boolean = false;
  private _0x7g8h: NodeJS.Timeout | null = null;
  private _0xOriginalDomain: string = '';

  private _0xGetDomain(): string {
    return window.location.hostname;
  }

  private _0xIsLocalhost(): boolean {
    const _0x1k2l = this._0xGetDomain();
    return _0x1k2l === 'localhost' || _0x1k2l === '127.0.0.1' || _0x1k2l.startsWith('192.168.');
  }

  private _0xCheckDomain(): boolean {
    if (this._0xIsLocalhost()) return true;

    const _0x3m4n = this._0xGetDomain();
    const _0xStored = localStorage.getItem('_0xOD');

    if (!_0xStored) {
      localStorage.setItem('_0xOD', _0x3m4n);
      this._0xOriginalDomain = _0x3m4n;
      return true;
    }

    this._0xOriginalDomain = _0xStored;

    const _0xNormalized = _0x3m4n.replace('www.', '');
    const _0xStoredNormalized = _0xStored.replace('www.', '');

    return _0xNormalized === _0xStoredNormalized;
  }

  private async _0xValidateWithServer(): Promise<DomainValidationResponse> {
    try {
      const _0x7q8r = this._0xGetDomain();
      const _0x9s0t = `${_0x9d4e}/functions/v1/validate-domain?action=validate`;

      const _0x1u2v = await fetch(_0x9s0t, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: _0x7q8r,
          token: this._0x1a2b
        })
      });

      if (!_0x1u2v.ok) {
        const _0x3w4x = await _0x1u2v.json();
        return _0x3w4x;
      }

      const _0x5y6z = await _0x1u2v.json();

      if (_0x5y6z.valid && _0x5y6z.token) {
        this._0x1a2b = _0x5y6z.token;
        localStorage.setItem('_0xDT', _0x5y6z.token);
      }

      return _0x5y6z;
    } catch {
      return {
        valid: true,
        reason: 'network_error'
      };
    }
  }

  private _0xRedirect(): void {
    if (this._0xIsLocalhost()) return;

    if (this._0xOriginalDomain) {
      const _0xProtocol = window.location.protocol;
      window.location.href = `${_0xProtocol}//${this._0xOriginalDomain}/`;
    }
  }

  private _0xCheckDevTools(): void {
    const _0x9c0d = new Date();
    console.log(_0x9c0d);
    console.clear();

    const _0x1e2f = new Date();
    if (_0x1e2f.getTime() - _0x9c0d.getTime() > 150) {
      this._0x3c4d++;
      if (this._0x3c4d > 10) {
        this._0xRedirect();
      }
    }
  }

  private _0xProtectDOM(): void {
    document.addEventListener('contextmenu', (_0x3g4h) => {
      _0x3g4h.preventDefault();
      this._0x3c4d++;
      if (this._0x3c4d > 15) {
        this._0xRedirect();
      }
    });

    document.addEventListener('keydown', (_0x5i6j) => {
      if (
        _0x5i6j.key === 'F12' ||
        (_0x5i6j.ctrlKey && _0x5i6j.shiftKey && _0x5i6j.key === 'I') ||
        (_0x5i6j.ctrlKey && _0x5i6j.shiftKey && _0x5i6j.key === 'C') ||
        (_0x5i6j.ctrlKey && _0x5i6j.shiftKey && _0x5i6j.key === 'J') ||
        (_0x5i6j.ctrlKey && _0x5i6j.key === 'U')
      ) {
        _0x5i6j.preventDefault();
        this._0x3c4d++;
        if (this._0x3c4d > 12) {
          this._0xRedirect();
        }
      }
    });

    const _0x7k8l = window.innerWidth - document.documentElement.clientWidth;
    const _0x9m0n = window.innerHeight - document.documentElement.clientHeight;

    if (_0x7k8l > 200 || _0x9m0n > 200) {
      this._0x3c4d++;
      if (this._0x3c4d > 8) {
        this._0xRedirect();
      }
    }
  }

  private _0xMonitorIntegrity(): void {
    setInterval(() => {
      const _0x1o2p = document.querySelectorAll('script').length;
      const _0x3q4r = document.querySelectorAll('link[rel="stylesheet"]').length;

      if (!this._0x5e6f) {
        this._0x5e6f = true;
        (window as any)._0xSC = _0x1o2p;
        (window as any)._0xCC = _0x3q4r;
      } else {
        if (
          Math.abs(_0x1o2p - (window as any)._0xSC) > 3 ||
          Math.abs(_0x3q4r - (window as any)._0xCC) > 2
        ) {
          this._0xRedirect();
        }
      }
    }, 5000);
  }

  private _0xSetupHeartbeat(): void {
    this._0x7g8h = setInterval(() => {
      if (!this._0xIsLocalhost()) {
        const _0x9w0x = this._0xCheckDomain();
        if (!_0x9w0x) {
          this._0xRedirect();
        }
      }
    }, 60000);
  }

  async initialize(): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const _0x7u8v = this._0xIsLocalhost();

      if (_0x7u8v) {
        return { allowed: true };
      }

      const _0x9w0x = this._0xCheckDomain();
      if (!_0x9w0x) {
        this._0xRedirect();
        return {
          allowed: false,
          reason: 'Domain não autorizado'
        };
      }

      this._0xProtectDOM();
      this._0xMonitorIntegrity();
      this._0xSetupHeartbeat();

      const _0x1y2z = localStorage.getItem('_0xDT');
      if (_0x1y2z) {
        this._0x1a2b = _0x1y2z;
      }

      setInterval(() => this._0xCheckDevTools(), 5000);

      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }

  async validateCheckout(): Promise<boolean> {
    const _0x5c6d = this._0xIsLocalhost();
    if (_0x5c6d) return true;

    const _0x7e8f = this._0xCheckDomain();
    if (!_0x7e8f) {
      this._0xRedirect();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return this._0x1a2b;
  }

  destroy(): void {
    if (this._0x7g8h) {
      clearInterval(this._0x7g8h);
    }
  }
}

export const antiClone = new AntiCloneProtection();
