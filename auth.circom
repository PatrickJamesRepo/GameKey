pragma circom 2.0.0; template AuthProof() {
    // Private input: secret (for example)
    signal input secret;
    // Public input: nonce
    signal input nonce;
    // Public input: expected output (for demo purposes)
    signal input expectedOutput;
    // Simple computation (in practice, use a real circuit-friendly function)
    signal computedOutput; computedOutput <== secret + nonce;
    // Enforce that the computed output matches the expected value.
    computedOutput === expectedOutput;
}
component main = AuthProof();
