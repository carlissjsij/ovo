const _0xCG = {
  _0xa2: import.meta.env.VITE_SUPABASE_URL,
  _0xa3: 0,
  _0xa4: false,
  _0xa5: null as string | null,
  _0xOD: '',
};

export class CheckoutGuard {
  private static _0xb1(): string {
    return window.location.hostname;
  }

  private static _0xb2(): boolean {
    const _0xh = CheckoutGuard._0xb1();
    return _0xh === 'localhost' || _0xh === '127.0.0.1' || _0xh.startsWith('192.168.');
  }

  private static _0xGetOriginalDomain(): string {
    if (!_0xCG._0xOD) {
      const _0xStored = localStorage.getItem('_0xOD');
      if (_0xStored) {
        _0xCG._0xOD = _0xStored;
      } else {
        _0xCG._0xOD = CheckoutGuard._0xb1();
        localStorage.setItem('_0xOD', _0xCG._0xOD);
      }
    }
    return _0xCG._0xOD;
  }

  private static _0xCheckDomain(): boolean {
    if (CheckoutGuard._0xb2()) return true;

    const _0xh = CheckoutGuard._0xb1();
    const _0xOriginal = CheckoutGuard._0xGetOriginalDomain();

    const _0xNormalized = _0xh.replace('www.', '');
    const _0xOriginalNormalized = _0xOriginal.replace('www.', '');

    return _0xNormalized === _0xOriginalNormalized;
  }

  private static _0xb3(): void {
    if (CheckoutGuard._0xb2()) return;

    const _0xOriginal = CheckoutGuard._0xGetOriginalDomain();
    if (_0xOriginal) {
      const _0xProtocol = window.location.protocol;
      window.location.replace(`${_0xProtocol}//${_0xOriginal}/`);
    }
  }

  private static _0xb4(): string {
    const _0xt = Date.now().toString(36);
    const _0xr = Math.random().toString(36).substring(2, 15);
    return `${_0xt}${_0xr}`;
  }

  private static async _0xb5(): Promise<boolean> {
    return CheckoutGuard._0xCheckDomain();
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
    const _0xe = ['copy', 'cut'];
    _0xe.forEach(_0xt => {
      document.addEventListener(_0xt, (_0xev) => {
        _0xCG._0xa3++;
        if (_0xCG._0xa3 > 20) {
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
        Math.abs(window.innerWidth - _0xw) > 400 ||
        Math.abs(window.innerHeight - _0xh) > 400
      ) {
        _0xCG._0xa3++;
        if (_0xCG._0xa3 > 25) {
          CheckoutGuard._0xb3();
        }
      }
      _0xw = window.innerWidth;
      _0xh = window.innerHeight;
    }, 2000);
  }

  static async protect(): Promise<boolean> {
    if (CheckoutGuard._0xb2()) {
      return true;
    }

    CheckoutGuard._0xGetOriginalDomain();

    CheckoutGuard._0xb7();
    CheckoutGuard._0xb8();
    CheckoutGuard._0xb9();
    CheckoutGuard._0xc0();
    CheckoutGuard._0xb6();

    setInterval(() => {
      if (!CheckoutGuard._0xCheckDomain()) {
        CheckoutGuard._0xb3();
      }
    }, 60000);

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

    if (!CheckoutGuard._0xCheckDomain()) {
      CheckoutGuard._0xb3();
      return false;
    }

    return true;
  }
}

export const checkoutGuard = CheckoutGuard;
