#!/bin/bash
set -e

# ZKP Circuit Compilation and Setup Script
# This script compiles all 5 ZKP circuits and generates proving/verification keys

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CIRCUITS_DIR="${SCRIPT_DIR}/circuits"
BUILD_DIR="${SCRIPT_DIR}/build"
KEYS_DIR="${SCRIPT_DIR}/keys"

echo "🔧 ZKP Circuit Setup"
echo "===================="
echo ""

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$KEYS_DIR"

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v circom &> /dev/null; then
    echo "❌ circom not found. Installing..."
    npm install -g circom
fi

if ! command -v snarkjs &> /dev/null; then
    echo "❌ snarkjs not found. Installing..."
    npm install -g snarkjs
fi

echo "✅ Prerequisites OK"
echo ""

# List of circuits to compile
CIRCUITS=(
    "membership"
    "structure"
    "selective-reveal"
    "version"
    "locker"
)

# Compile all circuits
echo "🔨 Compiling circuits..."
for circuit in "${CIRCUITS[@]}"; do
    echo "  - Compiling ${circuit}.circom..."
    circom "${CIRCUITS_DIR}/${circuit}.circom" \
        --r1cs \
        --wasm \
        --sym \
        --c \
        -o "$BUILD_DIR" \
        2>&1 | grep -v "pragma circom" || true
    
    echo "    ✓ ${circuit} compiled"
done
echo ""

# Display circuit info
echo "📊 Circuit Statistics:"
for circuit in "${CIRCUITS[@]}"; do
    if [ -f "${BUILD_DIR}/${circuit}.r1cs" ]; then
        echo "  - ${circuit}:"
        snarkjs r1cs info "${BUILD_DIR}/${circuit}.r1cs" 2>&1 | grep -E "(constraints|outputs)" || true
    fi
done
echo ""

# Generate or download Powers of Tau
PTAU_FILE="${KEYS_DIR}/pot14_final.ptau"

if [ ! -f "$PTAU_FILE" ]; then
    echo "🔐 Generating Powers of Tau (this may take a while)..."
    echo "    For production, use a multi-party ceremony!"
    
    # Start ceremony
    snarkjs powersoftau new bn128 14 "${KEYS_DIR}/pot14_0000.ptau" -v
    
    # First contribution
    snarkjs powersoftau contribute "${KEYS_DIR}/pot14_0000.ptau" \
        "${KEYS_DIR}/pot14_0001.ptau" \
        --name="First contribution" \
        -e="$(openssl rand -hex 32)" \
        -v
    
    # Prepare phase 2
    snarkjs powersoftau prepare phase2 "${KEYS_DIR}/pot14_0001.ptau" "$PTAU_FILE" -v
    
    # Cleanup intermediate files
    rm -f "${KEYS_DIR}/pot14_0000.ptau" "${KEYS_DIR}/pot14_0001.ptau"
    
    echo "    ✓ Powers of Tau ready"
else
    echo "✅ Using existing Powers of Tau file"
fi
echo ""

# Generate proving and verification keys for each circuit
echo "🔑 Generating proving and verification keys..."
for circuit in "${CIRCUITS[@]}"; do
    echo "  - ${circuit}:"
    
    # Setup
    snarkjs groth16 setup \
        "${BUILD_DIR}/${circuit}.r1cs" \
        "$PTAU_FILE" \
        "${KEYS_DIR}/${circuit}_0000.zkey" \
        2>&1 | grep -v "Reading r1cs" || true
    
    # Contribute
    snarkjs zkey contribute \
        "${KEYS_DIR}/${circuit}_0000.zkey" \
        "${KEYS_DIR}/${circuit}_final.zkey" \
        --name="First contribution" \
        -e="$(openssl rand -hex 32)" \
        -v 2>&1 | grep -v "Starting" || true
    
    # Export verification key
    snarkjs zkey export verificationkey \
        "${KEYS_DIR}/${circuit}_final.zkey" \
        "${KEYS_DIR}/${circuit}_vkey.json"
    
    # Cleanup intermediate zkey
    rm -f "${KEYS_DIR}/${circuit}_0000.zkey"
    
    echo "    ✓ Keys generated"
done
echo ""

# Generate verification key hash for integrity checking
echo "🔒 Generating verification key hashes..."
for circuit in "${CIRCUITS[@]}"; do
    if [ -f "${KEYS_DIR}/${circuit}_vkey.json" ]; then
        hash=$(sha256sum "${KEYS_DIR}/${circuit}_vkey.json" | cut -d' ' -f1)
        echo "  ${circuit}: ${hash}" >> "${KEYS_DIR}/vkey_hashes.txt"
        echo "  ✓ ${circuit}"
    fi
done
echo ""

echo "✨ Setup complete!"
echo ""
echo "📁 Generated files:"
echo "  - Compiled circuits: ${BUILD_DIR}/"
echo "  - Proving keys: ${KEYS_DIR}/*_final.zkey"
echo "  - Verification keys: ${KEYS_DIR}/*_vkey.json"
echo "  - Powers of Tau: ${PTAU_FILE}"
echo ""
echo "⚠️  IMPORTANT: For production use:"
echo "  1. Run a multi-party trusted setup ceremony"
echo "  2. Verify all contributions independently"
echo "  3. Conduct formal security audits"
echo "  4. Store proving keys securely"
echo ""
