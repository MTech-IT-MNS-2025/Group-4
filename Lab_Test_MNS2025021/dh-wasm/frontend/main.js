console.log("main.js loaded");

createModexpModule().then(Module => {

    // The ONLY exported name in your WASM is "_modexp"
    const modexp = Module._modexp;  // <-- USE THIS

    console.log("WASM modexp detected:", modexp);

    document.getElementById("dhForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const A = parseInt(document.getElementById("inputA").value);
        const B = parseInt(document.getElementById("inputB").value);

        const g = 5;
        const p = 23;

        const X = modexp(g, A, p);   // Alice computes g^A mod p
        const Y = modexp(g, B, p);   // Bob computes g^B mod p

        const keyA = modexp(Y, A, p);
        const keyB = modexp(X, B, p);

        document.getElementById("output").innerText =
            `Given g = ${g}, p = ${p}\n` +
            `A = ${A}, B = ${B}\n\n` +
            `Alice computes X = g^A mod p = ${X}\n` +
            `Bob computes   Y = g^B mod p = ${Y}\n\n` +
            `Alice's key = Y^A mod p = ${keyA}\n` +
            `Bob's key   = X^B mod p = ${keyB}\n\n` +
            `Shared Secret Key = ${keyA}`;
    });

});
