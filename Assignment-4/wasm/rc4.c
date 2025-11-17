#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>

// Key Scheduling Algorithm (KSA)
void ksa(unsigned char *S, unsigned char *key, int key_length) {
    int i, j = 0;
    unsigned char temp;
    
    // Initialize S array with values 0-255
    for (i = 0; i < 256; i++) {
        S[i] = i;
    }
    
    // Scramble S array based on key
    for (i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % key_length]) % 256;
        
        // Swap S[i] and S[j]
        temp = S[i];
        S[i] = S[j];
        S[j] = temp;
    }
}

// Pseudo-Random Generation Algorithm (PRGA)
void prga(unsigned char *S, unsigned char *data, int data_length) {
    int i = 0, j = 0, k;
    unsigned char temp;
    
    for (k = 0; k < data_length; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        
        // Swap S[i] and S[j]
        temp = S[i];
        S[i] = S[j];
        S[j] = temp;
        
        // XOR data with keystream byte
        data[k] ^= S[(S[i] + S[j]) % 256];
    }
}

// Main RC4 encryption/decryption function
EMSCRIPTEN_KEEPALIVE
void rc4_cipher(unsigned char *data, int data_length, unsigned char *key, int key_length) {
    unsigned char S[256];
    
    // Validate inputs
    if (data == NULL || key == NULL || data_length <= 0 || key_length <= 0) {
        return;
    }
    
    // Initialize state array with key
    ksa(S, key, key_length);
    
    // Generate keystream and XOR with data
    prga(S, data, data_length);
}

// Allocate memory - exposed to JavaScript
EMSCRIPTEN_KEEPALIVE
unsigned char* allocate_memory(int size) {
    if (size <= 0) return NULL;
    return (unsigned char*)malloc(size);
}

// Free memory - exposed to JavaScript
EMSCRIPTEN_KEEPALIVE
void free_memory(unsigned char* ptr) {
    if (ptr != NULL) {
        free(ptr);
    }
}

