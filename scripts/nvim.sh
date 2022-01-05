#!/bin/bash

DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." &> /dev/null && pwd)"
TMP="$DIR/.tmp"

# rm -rf $TMP
mkdir -p $TMP/{share/nvim,state,cache,config/nvim}

PLUGGED="$TMP/share/data/plugged"
PLUG_FILE="$TMP/share/nvim/site/autoload/plug.vim"
PLUG_URL='https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'

cat > $TMP/config/nvim/init.lua <<EOF
vim.cmd [[
  call plug#begin('$PLUGGED')
  Plug 'josa42/theme-theonedark', { 'rtp': 'dist/vim' }
  Plug 'neoclide/coc.nvim', {'branch': 'release'}
  Plug '$DIR'
  call plug#end()
]]

vim.cmd('colorscheme theonedark')

vim.opt.encoding = 'utf-8'
vim.opt.hidden = true
vim.opt.backup = false
vim.opt.writebackup = false
vim.opt.cmdheight = 2
vim.opt.updatetime = 300
vim.opt.shortmess:append('c')
vim.opt.signcolumn = 'yes'
vim.opt.number = true
vim.opt.listchars = 'tab:» ,extends:›,precedes:‹,nbsp:·,space:·,trail:·'
vim.opt.list = true
vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = false

vim.api.nvim_set_keymap('i', '<c-space>', 'coc#refresh()', { silent = true, expr = true })
vim.api.nvim_set_keymap('n', 'gd', '<Plug>(coc-definition)', { silent = true })
vim.api.nvim_set_keymap('n', 'gf', 'CocAction("format")', { silent = true, expr = true })
EOF

export XDG_CONFIG_HOME=$TMP/config
export XDG_CACHE_HOME=$TMP/cache
export XDG_DATA_HOME=$TMP/share
export XDG_STATE_HOME=$TMP/state


if [[ ! -f "$PLUG_FILE" ]]; then
  curl -sSfLo $PLUG_FILE --create-dirs $PLUG_URL
  nvim --headless +'PlugInstall | PlugUpdate| qa!'
fi

nvim "$@"

