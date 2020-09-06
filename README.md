# coc-go

Go language server extension using [`gopls`](https://github.com/golang/go/wiki/gopls)
for [`coc.nvim`](https://github.com/neoclide/coc.nvim).

## Install

In your vim/neovim, run command:

```
:CocInstall coc-go
```

## Features

See [`gopls`](https://github.com/golang/tools/blob/master/gopls/README.md)

## Commands

Additional to commands provided by gopls, this extensions provides these commands:

| Key                             | Description                                        |
|---------------------------------|----------------------------------------------------|
| **`go.impl.cursor`**            | Generate interface stubs                           |
| **`go.install.gomodifytags`**   | Install / update gomodifytags                      |
| **`go.install.goplay`**         | Install / update goplay                            |
| **`go.install.gopls`**          | Install / update gopls                             |
| **`go.install.gotests`**        | Install / update gotests                           |
| **`go.install.impl`**           | Install / update impl                              |
| **`go.install.tools`**          | Install / update all tools                         |
| **`go.playground`**             | Run on go playground                               |
| **`go.tags.add`**               | Add tags to struct fields                          |
| **`go.tags.add.line`**          | Add tags to struct field in current line           |
| **`go.tags.add.prompt`**        | Add tags to struct fields (prompt)                 |
| **`go.tags.clear`**             | Remove all tags from struct fields                 |
| **`go.tags.clear.line`**        | Remove all tags from struct fields in current line |
| **`go.tags.remove`**            | Remove tags from struct fields                     |
| **`go.tags.remove.line`**       | Remove tags from struct field in current line      |
| **`go.tags.remove.prompt`**     | Remove tags from struct fields (prompt)            |
| **`go.test.generate.exported`** | Generate unit tests for exported functions in file |
| **`go.test.generate.file`**     | Generate unit tests for file                       |
| **`go.test.generate.function`** | Generate unit tests for current function           |
| **`go.test.toggle`**            | Toggle test file                                   |
| **`go.version`**                | Print extension version                            |

### Examples

- **Add or Remove specific tags**

  ```
  CocCommand go.tags.add yaml
  CocCommand go.tags.add yaml json xml
  CocCommand go.tags.remove xml
  ```

- **Add missing imports on save**

  ```
  autocmd BufWritePre *.go :call CocAction('organizeImport')
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

| Key                         | Description                                                                                                                                                 | Default               |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| **`go.checkForUpdates`**    | **EXPERIMENTAL** Check for gopls updates on start.                                                                                                          |                       |
| **`go.disable`**            | Disable gopls features                                                                                                                                      |                       |
| ‣ `completion`              | Disable completion feature (Change requires `:CocRestart`)                                                                                                  | false                 |
| ‣ `diagnostics`             | Disable handle diagnostics (Change requires `:CocRestart`)                                                                                                  | false                 |
| ‣ `workspaceFolders`        | Disable workspaceFolders feature (Change requires `:CocRestart`)                                                                                            | false                 |
| **`go.enable`**             | Enable Go extension                                                                                                                                         |                       |
| **`go.goplsArgs`**          | Arguments passed to `gopls` (Change requires `:CocRestart`)                                                                                                 |                       |
| **`go.goplsEnv`**           | ENV passed to `gopls` (Change requires `:CocRestart`)                                                                                                       |                       |
| **`go.goplsOptions`**       | See [`gopls` documentation](https://github.com/golang/tools/blob/master/gopls/doc/settings.md)                                                              |                       |
| ‣ `analyses`                | **EXPERIMENTAL** Analyses specify analyses that the user would like to enable or disable.                                                                   |                       |
| ‣ `annotations`             | **EXPERIMENTAL**                                                                                                                                            |                       |
| ‣ `buildFlags`              | This is the set of flags passed on to the build system when invoked.                                                                                        |                       |
| ‣ `codelens`                | **EXPERIMENTAL** Overrides the enabled/disabled state of various code lenses.                                                                               |                       |
| ‣ `completeUnimported`      | **EXPERIMENTAL** If true, the completion engine is allowed to make suggestions for packages that you do not currently import.                               | false                 |
| ‣ `completionDocumentation` | **EXPERIMENTAL** If false, indicates that the user does not want documentation with completion results.                                                     | true                  |
| ‣ `deepCompletion`          | **EXPERIMENTAL** If true, this turns on the ability to return completions from deep inside relevant entities, rather than just the locally accessible ones. | true                  |
| ‣ `env`                     | This can be used to add environment variables.                                                                                                              |                       |
| ‣ `expandWorkspaceToModule` | This is true if `gopls` should expand the scope of the workspace to include the modules containing the workspace folders.                                   | true                  |
| ‣ `fuzzyMatching`           | **EXPERIMENTAL** If true, this enables server side fuzzy matching of completion candidates.                                                                 | true                  |
| ‣ `hoverKind`               | This controls the information that appears in the hover text.                                                                                               | SynopsisDocumentation |
| ‣ `linkTarget`              | This controls where points documentation for given package in `textDocument/documentLink`.                                                                  | pkg.go.dev            |
| ‣ `local`                   | This is the equivalent of the `goimports -local` flag, which puts imports beginning with this string after 3rd-party packages.                              |                       |
| ‣ `matcher`                 | **EXPERIMENTAL**                                                                                                                                            | caseInsensitive       |
| ‣ `staticcheck`             | **EXPERIMENTAL** If true, it enables the use of the staticcheck.                                                                                            |                       |
| ‣ `symbolMatcher`           | **EXPERIMENTAL**                                                                                                                                            | caseInsensitive       |
| ‣ `usePlaceholders`         | If true, then completion responses may contain placeholders for function parameters or struct fields.                                                       | false                 |
| **`go.goplsPath`**          | Path to `gopls` bin (Change requires `:CocRestart`)                                                                                                         |                       |
| **`go.goplsUseDaemon`**     | Run gopls as daemon                                                                                                                                         | true                  |
| **`go.tags`**               |                                                                                                                                                             |                       |
| ‣ `options`                 | Comma separated tag=options pairs to be used by `go.tags.add` command                                                                                       | json=omitempty        |
| ‣ `skipUnexported`          | If true, skip unexported fields                                                                                                                             | false                 |
| ‣ `tags`                    | Comma separated tags to be used by `go.tags.add` command                                                                                                    | json                  |
| ‣ `transform`               | Transformation rule used by `go.tags.add` command to add tags                                                                                               | snakecase             |
| **`go.tests`**              |                                                                                                                                                             |                       |
| ‣ `generateFlags`           | Additional command line flags to pass to `gotests` for generating tests.                                                                                    | []                    |
| **`go.trace.server`**       | Trace level of gopls                                                                                                                                        |                       |

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

- Check for tool updates and prompt the the user

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
- [`impl`](https://github.com/josharian/impl) - [MIT](https://github.com/josharian/impl/blob/master/LICENSE.txt)

## FAQ

### How does `coc-go` compare to `vim-go`?

With `coc-go` I do not aim to recreate the features of `vim-go`. For now, the
main goal is to provide a convenient way to install `gopls` and use it with
`coc.nvim`.

If you need more than the features provided by `gopls`, you are probably better
of with [`vim-go`](https://github.com/fatih/vim-go) or
[`govim`](https://github.com/govim/govim).

### How to use `coc-go` with wasm?

Add this to you (local) `coc-settings.json` (run `:CocLocalConfig`).

```json
{
  "go.goplsEnv": {
    "GOOS": "js",
    "GOARCH": "wasm",
  }
}
```

### Running gopls as a daemon

`coc-go` runs `gopls` as shared daemon by passing `-remote=auto` to `gopls`. To
disable this behavior set `go.goplsUseDaemon` to `false`.

See [Running gopls as a daemon](https://github.com/golang/tools/blob/master/gopls/doc/daemon.md) for more information.

## License

[MIT © Josa Gesell](LICENSE).
