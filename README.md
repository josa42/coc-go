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

| Key                                      |                                                                                                                                                                                                          |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `go.install.gopls`                       | Install / Update gopls                                                                                                                                                                                   |
| `go.install.gomodifytags`                | Install / Update gomodifytags                                                                                                                                                                            |
| `go.install.gotests`                     | Install / Update gotests                                                                                                                                                                                 |
| `go.version`                             | Print extension version                                                                                                                                                                                  |
| `go.tags.add`                            | Add Tags To Struct Fields                                                                                                                                                                                |
| `go.tags.add.line`                       | Add Tags To Struct Field at current line                                                                                                                                                                 |
| `go.tags.add.prompt`                     | Add Tags To Struct Fields (prompt)                                                                                                                                                                       |
| `go.tags.remove`                         | Remove Tags From Struct Fields                                                                                                                                                                           |
| `go.tags.remove.line`                    | Remove Tags From Struct Field at current line                                                                                                                                                            |
| `go.tags.remove.prompt`                  | Remove Tags From Struct Fields (prompt)                                                                                                                                                                  |
| `go.tags.clear`                          | RemoAe All Tags From Struct Fields                                                                                                                                                                       |
| `go.tags.clear.line`                     | RemoAe All Tags From Struct Fields at current line                                                                                                                                                       |
| `go.test.generate.file`                  | Generate Unit Tests For File                                                                                                                                                                             |
| `go.test.generate.exported`              | Generate Unit Tests For Exported Functions in File                                                                                                                                                       |
| `go.test.toggle`                         | Toggle Test File                                                                                                                                                                                         |
| `go.playground`                          | Run on Go Playground                                                                                                                                                                                     |

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

| Key                                      |                                                                                                                                                                                                          |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `go.enable`                              | Enable Go extension                                                                                                                                                                                      |
| `go.goplsOptions`                        | See gopls documentation: https://github.com/golang/tools/blob/master/gopls/doc/settings.md                                                                                                               |
| ‣ `buildFlags`                           | This is the set of flags passed on to the build system when invoked. It is applied to queries like go list, which is used when discovering files. The most common use is to set -tags.                   |
| ‣ `completeUnimported`                   | **EXPERIMENTAL** If true, the completion engine is allowed to make suggestions for packages that you do not currently import.                                                                            |
| ‣ `completionDocumentation`              | **EXPERIMENTAL** If false, indicates that the user does not want documentation with completion results.                                                                                                  |
| ‣ `deepCompletion`                       | **EXPERIMENTAL** If true, this turns on the ability to return completions from deep inside relevant entities, rather than just the locally accessible ones.                                              |
| ‣ `env`                                  | This can be used to add environment variables. These will not affect gopls itself, but will be used for any external commands it invokes.                                                                |
| ‣ `experimentalDisabledAnalyses`         | **EXPERIMENTAL** A list of the names of analysis passes that should be disabled. You can use this to turn off analyses that you feel are not useful in the editor.                                       |
| ‣ `hoverKind`                            | This controls the information that appears in the hover text.                                                                                                                                            |
| ‣ `staticcheck`                          | **EXPERIMENTAL** If true, it enables the use of the staticcheck.io analyzers.                                                                                                                            |
| ‣ `usePlaceholders`                      | If true, then completion responses may contain placeholders for function parameters or struct fields.                                                                                                    |
| `go.goplsPath`                           | Path to gopls bin                                                                                                                                                                                        |
| `go.tags`                                |                                                                                                                                                                                                          |
| ‣ `options`                              | Comma separated tag=options pairs to be used by Go: Add Tags command                                                                                                                                     |
| ‣ `tags`                                 | Comma separated tags to be used by Go: Add Tags command                                                                                                                                                  |
| ‣ `transform`                            | Transformation rule used by Go: Add Tags command to add tags                                                                                                                                             |
| `go.tests`                               |                                                                                                                                                                                                          |
| ‣ `generateFlags`                        | Additional command line flags to pass to `gotests` for generating tests.                                                                                                                                 |

Trigger completion in `coc-settings.json` to get complete list.

### Example Configuration

```json
{
  "go.goplsOptions": {
    "completeUnimported": true
  }
}
```

## Development

1. Run `yarn build` or `yarn build:watch`
2. Run `yarn run link:add` to link extension

## TODO

- Add [`goimpl`](https://github.com/sasha-s/goimpl) command
  
  ```
  {
    "command": "go.impl.cursor",
    "title": "Generate Interface Stubs"
  }
  ```

- Add [`godoctor`](https://github.com/godoctor/godoctor) refactor commands

  ```
  {
    "command": "go.godoctor.extract",
    "title": "Extract to function"
  },
  {
    "command": "go.godoctor.variable",
    "title": "Extract to variable"
  }
  ```

- Add [`fillstruct`](https://github.com/davidrjenni/reftools/tree/master/cmd/fillstruct) command

  ```
  {
    "command": "go.fill.struct",
    "title": "Fill struct"
  }
  ```

## Tools

- [`gomodifytags`](http://github.com/fatih/gomodifytags) - [BSD](https://github.com/fatih/gomodifytags/blob/master/LICENSE)
- [`goplay`](http://github.com/haya14busa/goplay) - [MIT](https://github.com/haya14busa/goplay/blob/master/LICENSE)
- [`gopls`](https://golang.org/x/tools/cmd/gopls)
- [`gotests`](http://github.com/cweill/gotests) - [Apache](https://github.com/cweill/gotests/blob/develop/LICENSE)

## License

[MIT © Josa Gesell](LICENSE)
