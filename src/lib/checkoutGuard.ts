const _0xCG = {
  _0xa1: 'faberbrasil.top',
  _0xa2: import.meta.env.VITE_SUPABASE_URL,
  _0xa3: 0,
  _0xa4: false,
  _0xa5: null as string | null,
};

export class CheckoutGuard {
  private static _0xb1(): string {
    return window.location.hostname;
  }

  private static _0xb2(): boolean {
    const _0xh = CheckoutGuard._0xb1();
    return _0xh === 'localhost' || _0xh === '127.0.0.1' || _0xh.startsWith('192.168.');
  }

  private static _0xb3(): void {
    if (!CheckoutGuard._0xb2()) {
      const _0xh = CheckoutGuard._0xb1();
      if (_0xh !== _0xCG._0xa1 && _0xh !== `www.${_0xCG._0xa1}`) {
        window.location.replace(`https://${_0xCG._0xa1}/`);
      }
    }
  }

  private static _0xb4(): string {
    const _0xt = Date.now().toString(36);
    const _0xr = Math.random().toString(36).substring(2, 15);
    return `${_0xt}${_0xr}`;
  }

  private static async _0xb5(): Promise<boolean> {
    try {
      const _0xh = CheckoutGuard._0xb1();
      const _0xu = `${_0xCG._0xa2}/functions/v1/validate-domain?action=check`;

      const _0xr = await fetch(_0xu, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: _0xh })
      });

      if (!_0xr.ok) return false;

      const _0xd = await _0xr.json();
      return _0xd.valid === true;
    } catch {
      return false;
    }
  }

  private static _0xb6(): void {
    if (_0xCG._0xa4) return;
    _0xCG._0xa4 = true;

    const _0xo = {
      get: function(_0xt: any, _0xp: string) {
        if (_0xp === 'id') {
          _0xCG._0xa3++;
          if (_0xCG._0xa3 > 5) {
            CheckoutGuard._0xb3();
          }
        }
        return _0xt[_0xp];
      }
    };

    document.body = new Proxy(document.body, _0xo);
  }

  private static _0xb7(): void {
    const _0xe = ['copy', 'cut', 'paste', 'selectstart'];
    _0xe.forEach(_0xt => {
      document.addEventListener(_0xt, (_0xev) => {
        _0xev.preventDefault();
        _0xCG._0xa3++;
        if (_0xCG._0xa3 > 8) {
          CheckoutGuard._0xb3();
        }
      });
    });
  }

  private static _0xb8(): void {
    const _0xs = document.createElement('div');
    _0xs.id = '_0xck';
    _0xs.style.display = 'none';
    _0xs.setAttribute('data-integrity', CheckoutGuard._0xb4());
    document.body.appendChild(_0xs);

    setInterval(() => {
      const _0xe = document.getElementById('_0xck');
      if (!_0xe || !_0xe.hasAttribute('data-integrity')) {
        CheckoutGuard._0xb3();
      }
    }, 2000);
  }

  private static _0xb9(): void {
    const _0xm = new MutationObserver((_0xmu) => {
      _0xmu.forEach((_0xm) => {
        if (_0xm.type === 'childList') {
          _0xm.removedNodes.forEach((_0xn) => {
            if ((_0xn as Element).id === '_0xck') {
              CheckoutGuard._0xb3();
            }
          });
        }
      });
    });

    _0xm.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private static _0xc0(): void {
    let _0xw = window.innerWidth;
    let _0xh = window.innerHeight;

    setInterval(() => {
      if (
        Math.abs(window.innerWidth - _0xw) > 300 ||
        Math.abs(window.innerHeight - _0xh) > 300
      ) {
        _0xCG._0xa3++;
        if (_0xCG._0xa3 > 10) {
          CheckoutGuard._0xb3();
        }
      }
      _0xw = window.innerWidth;
      _0xh = window.innerHeight;
    }, 1000);
  }

  static async protect(): Promise<boolean> {
    if (CheckoutGuard._0xb2()) {
      return true;
    }

    const _0xv = await CheckoutGuard._0xb5();
    if (!_0xv) {
      CheckoutGuard._0xb3();
      return false;
    }

    CheckoutGuard._0xb6();
    CheckoutGuard._0xb7();
    CheckoutGuard._0xb8();
    CheckoutGuard._0xb9();
    CheckoutGuard._0xc0();

    setInterval(async () => {
      const _0xr = await CheckoutGuard._0xb5();
      if (!_0xr) {
        CheckoutGuard._0xb3();
      }
    }, 15000);

    return true;
  }

  static validateBeforePayment(): boolean {
    if (CheckoutGuard._0xb2()) {
      return true;
    }

    const _0xe = document.getElementById('_0xck');
    if (!_0xe || !_0xe.hasAttribute('data-integrity')) {
      CheckoutGuard._0xb3();
      return false;
    }

    const _0xh = CheckoutGuard._0xb1();
    if (_0xh !== _0xCG._0xa1 && _0xh !== `www.${_0xCG._0xa1}`) {
      CheckoutGuard._0xb3();
      return false;
    }

    return true;
  }
}

export const checkoutGuard = CheckoutGuard;
