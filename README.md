# coc-go

Go language server extension using [`gopls`](https://github.com/golang/go/wiki/gopls)
for [`coc.nvim`](https://github.com/neoclide/coc.nvim).

## Install

In your vim/neovim, run command:

```
:CocInstall coc-go
```

## Features

See [`gopls`](https://github.com/golang/go/wiki/gopls)

## Commands

Additional to commands provided by gopls, this extensions provides these commands:

| Key                         |                                                    |
|-----------------------------|----------------------------------------------------|
| `go.install.gomodifytags`   | Install / Update gomodifytags                      |
| `go.install.gopls`          | Install / Update gopls                             |
| `go.install.gotests`        | Install / Update gotests                           |
| `go.playground`             | Run on Go Playground                               |
| `go.tags.add.line`          | Add Tags To Struct Field at current line           |
| `go.tags.add.prompt`        | Add Tags To Struct Fields (prompt)                 |
| `go.tags.add`               | Add Tags To Struct Fields                          |
| `go.tags.clear.line`        | Remove All Tags From Struct Field at line          |
| `go.tags.clear`             | Remove All Tags From Struct Fields                 |
| `go.tags.remove.line`       | Remove Tags From Struct Field at line              |
| `go.tags.remove.prompt`     | Remove Tags From Struct Fields (prompt)            |
| `go.tags.remove`            | Remove Tags From Struct Fields                     |
| `go.test.generate.exported` | Generate Unit Tests For Exported Functions in File |
| `go.test.generate.file`:    | Generate Unit Tests For File                       |
| `go.test.toggle`            | Toggle Test File                                   |
| `go.version`                | Print extension version                            |

### Examples

- **Add or Remove specific tags**

  ```
  CocCommand go.tags.add yaml
  CocCommand go.tags.add yaml json xml
  CocCommand go.tags.remove xml
  ```

- **Add missing imports on save**

  ```
  autocmd BufWritePre *.go :CocCommand editor.action.organizeImport
  ```

- **Map Keys to command**

  ```
  autocmd FileType go nmap gtj :CocCommand go.tags.add json<cr>
  autocmd FileType go nmap gty :CocCommand go.tags.add yaml<cr>
  autocmd FileType go nmap gtx :CocCommand go.tags.clear<cr>
  ```

## Snippets

Snippets are imported from [`microsoft/vscode-go`](https://github.com/microsoft/vscode-go)
and require [`coc-snippets`](https://github.com/neoclide/coc-snippets) to be
installed.

## Configuration options

| Key                      |                                                                           |
|--------------------------|---------------------------------------------------------------------------|
| `go.enable`              | Set to `false` to disable gopls language server.                          |
| `go.commandPath`         | Absolute path of gopls executable.                                        |
| `go.tags.tags`           | Comma separated tags to be used by `go.tags.add` command                  |
| `go.tags.options`        | Comma separated tag=options pairs to be used by `go.tags.add` command     |
| `go.tags.transform`      | Transformation rule used by `go.tags.add` command to add tags             |
| `go.tests.generateFlags` | Additional command line flags to pass to `gotests` for generating tests." |

Trigger completion in `coc-settings.json` to get complete list.

## Development

1. Run `yarn build` or `yarn build:watch`
2. Run `yarn run link:add` to link extension

## TODO

- Add [`goimpl`](https://github.com/sasha-s/goimpl) command
  
  ```
  {
    "command": "go.impl.cursor",
    "title": "Go: Generate Interface Stubs"
  }
  ```

- Add [`godoctor`](https://github.com/godoctor/godoctor) refactor commands

  ```
  {
    "command": "go.godoctor.extract",
    "title": "Go: Extract to function"
  },
  {
    "command": "go.godoctor.variable",
    "title": "Go: Extract to variable"
  }
  ```

- Add [`fillstruct`](https://github.com/davidrjenni/reftools/tree/master/cmd/fillstruct) command

  ```
  {
    "command": "go.fill.struct",
    "title": "Go: Fill struct"
  }
  ```

## Tools

- [`gomodifytags`](http://github.com/fatih/gomodifytags) - [BSD](https://github.com/fatih/gomodifytags/blob/master/LICENSE)
- [`goplay`](http://github.com/haya14busa/goplay) - [MIT](https://github.com/haya14busa/goplay/blob/master/LICENSE)
- [`gopls`](https://golang.org/x/tools/cmd/gopls)
- [`gotests`](http://github.com/cweill/gotests) - [Apache](https://github.com/cweill/gotests/blob/develop/LICENSE)

## License

[MIT © Josa Gesell](LICENSE)
