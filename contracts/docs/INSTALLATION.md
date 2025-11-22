# Installation Guide

Quick guide for installing dependencies after cloning.

## Prerequisites

Check you have these installed:

```bash
forge --version    # Foundry
node --version     # Node.js v18+
npm --version
cargo --version    # Rust
```

If missing:

```bash
# Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js - visit nodejs.org or use nvm
```

## Quick Install

From the `contracts/` directory:

```bash
make install
```

This installs:
1. Celo npm packages (`@selfxyz/contracts`)
2. Celo Foundry dependencies (`forge-std`)
3. Oasis npm packages (`@oasisprotocol/sapphire-contracts`)
4. Oasis Foundry dependencies (`forge-std`)
5. ROFL Rust dependencies

## Manual Install (if needed)

**Celo:**
```bash
cd celo
npm install
forge install
```

**Oasis:**
```bash
cd oasis
npm install
forge install
```

**ROFL:**
```bash
cd rofl
cargo build --release
```

## Verify Install

Build everything:

```bash
make build
```

Should see:
```
Building Celo contracts...
Compiler run successful!
Building Oasis contracts...
Compiler run successful!
Building ROFL service...
Finished release [optimized]
✓ All contracts compiled successfully
```

## What Gets Installed

**Celo:**
- npm: `@selfxyz/contracts` (Self SDK)
- forge: `forge-std`

**Oasis:**
- npm: `@oasisprotocol/sapphire-contracts`
- forge: `forge-std`

**ROFL:**
- All Rust crates from `Cargo.toml`

## Gitignore

Dependencies aren't committed. The .gitignore excludes:
- `**/node_modules/`
- `**/lib/`
- `**/target/`
- `**/Cargo.lock`

Only source code and configs are in git.

## Troubleshooting

**npm install fails:**
```bash
npm cache clean --force
cd celo && npm install
```

**forge install fails:**
```bash
foundryup
cd celo && forge install
```

**cargo build fails:**
```bash
rustup update
cd rofl && cargo build --release
```

**Permission denied:**
```bash
# macOS/Linux
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.cargo
```

## Clean Install

To reinstall everything:

```bash
make clean
make install
make build
```

## After Install

Next steps:
1. Setup: See [SETUP.md](./SETUP.md) for wallet and env config
2. Deploy: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment

## Quick Commands

```bash
make install   # Install all deps
make build     # Compile contracts
make clean     # Remove artifacts
make help      # Show all commands
```

Dependencies aren't committed, so always run `make install` after cloning.
