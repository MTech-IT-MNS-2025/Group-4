#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
unsigned int modexp(unsigned int base, unsigned int exp, unsigned int mod) {

    if (mod == 0) return 0;   // safety check

    unsigned long long result = 1;
    base = base % mod;

    while (exp > 0) {
        if (exp & 1)
            result = (result * base) % mod;

        base = (base * base) % mod;
        exp >>= 1;
    }

    return (unsigned int)result;
}

