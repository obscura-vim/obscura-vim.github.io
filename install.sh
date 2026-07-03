#!/bin/sh
# ObscuraVim installer — https://obscuravim.xyz
#
#   curl -fsSL https://obscuravim.xyz/install.sh | sh
#
# Detects your Neovim version and installs the right tier:
#   - Neovim >= 0.11        -> full config  (github.com/obscura-vim/obscura-vim)
#   - older Neovim / none   -> minimal single-file config
#                              (github.com/obscura-vim/obscura-minimal)
# An existing config is backed up, never overwritten.

set -eu

FULL_REPO="https://github.com/obscura-vim/obscura-vim.git"
MINIMAL_RAW="https://raw.githubusercontent.com/obscura-vim/obscura-minimal/main/init.vim"

NVIM_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/nvim"

say() { printf '%s\n' "$*"; }

backup() {
    if [ -e "$1" ]; then
        b="$1.bak.$(date +%Y%m%d%H%M%S)"
        mv "$1" "$b"
        say "Backed up $1 -> $b"
    fi
}

nvim_minor() {
    # "NVIM v0.11.2" -> "11"; empty if nvim is missing
    command -v nvim >/dev/null 2>&1 || return 0
    nvim --version 2>/dev/null | sed -n '1s/^NVIM v\([0-9]*\)\.\([0-9]*\).*/\1 \2/p'
}

install_full() {
    command -v git >/dev/null 2>&1 || {
        say "git is required for the full config"; exit 1;
    }
    backup "$NVIM_DIR"
    git clone --depth 1 "$FULL_REPO" "$NVIM_DIR"
    say "Installed full ObscuraVim into $NVIM_DIR"

    say "Bootstrapping plugins, mason tools and treesitter parsers"
    say "(headless, may take a few minutes on first install)..."
    if nvim --headless "+ObscuraSync" +qa; then
        say "Bootstrap complete: nvim is fully ready."
    else
        say "warning: bootstrap finished with errors."
        say "Run :ObscuraSync inside nvim to retry."
    fi
}

install_minimal() {
    if command -v nvim >/dev/null 2>&1; then
        backup "$NVIM_DIR"
        mkdir -p "$NVIM_DIR"
        target="$NVIM_DIR/init.vim"
    else
        backup "$HOME/.vimrc"
        target="$HOME/.vimrc"
    fi
    curl -fsSL "$MINIMAL_RAW" -o "$target"
    say "Installed ObscuraVim Minimal into $target"
}

main() {
    ver="$(nvim_minor)"
    if [ -n "$ver" ]; then
        major="${ver%% *}"
        minor="${ver##* }"
        if [ "$major" -gt 0 ] || [ "$minor" -ge 11 ]; then
            say "Neovim 0.$minor detected -> full config"
            install_full
            return
        fi
        say "Neovim 0.$minor is too old for the full config -> minimal tier"
    else
        say "Neovim not found -> minimal tier (vim)"
    fi
    install_minimal
}

main
