# coc-go

Go language server extension using [`gopls`](https://github.com/golang/go/wiki/gopls)
for [`coc.nvim`](https://github.com/neoclide/coc.nvim).

## Install

In your vim/neovim, run command:

    :CocInstall coc-go

## Features

See [`gopls`](https://github.com/golang/go/wiki/gopls)

## Configuration options

- `go.enable` set to `false` to disable gopls language server.
- `go.commandPath` absolute path of gopls executable.

Trigger completion in `coc-settings.json` to get complete list.

## Development

1. Run `yarn build` or `yarn build:watch`
2. Link extension

```sh
cd ~/github/coc-go          && yarn link
cd ~/.config/coc/extensions && yarn link coc-go
```

3. Add `"coc-go": "*"` to dependencies in `~/.config/coc/extensions/package.json`

## License

[MIT © Josa Gesell](LICENSE)
