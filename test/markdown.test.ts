import {Command as Base, flags} from '@dxcli/command'
import {ICommand} from '@dxcli/config'
import {expect, test as base} from '@dxcli/test'
import stripAnsi = require('strip-ansi')

global.columns = 80
import Help from '../src'

class Command extends Base {
  async run() { return }
}

const test = base
.loadConfig()
.add('help', ctx => new Help(ctx.config))
.register('commandHelp', (command?: ICommand) => ({
  run(ctx: {help: Help, commandHelp: string, expectation: string}) {
    const cached = command!.convertToCached()
    let help = ctx.help.command(cached, {markdown: true})
    ctx.commandHelp = stripAnsi(help).split('\n').map(s => s.trimRight()).join('\n')
    ctx.expectation = 'has commandHelp'
  }
}))

describe('command help', () => {
  test
  .commandHelp(class extends Command {
    static title = 'the title'
    static id = 'apps:create'
    static aliases = ['app:init', 'create']
    static description = `some

  multiline help
  `
    static args = [{name: 'app_name', description: 'app to use'}]
    static flags = {
      app: flags.string({char: 'a', hidden: true}),
      foo: flags.string({char: 'f', description: 'foobar'.repeat(18)}),
      force: flags.boolean({description: 'force  it '.repeat(15)}),
      ss: flags.boolean({description: 'newliney\n'.repeat(4)}),
      remote: flags.string({char: 'r'}),
    }})
  .skip()
  .it(ctx => expect(ctx.commandHelp).to.equal(`the title
=========

USAGE
  $ dxcli apps:create [APP_NAME] [OPTIONS]

ARGUMENTS
  APP_NAME  app to use

OPTIONS
  -f, --foo=foo        foobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoo
                       barfoobarfoobarfoobarfoobarfoobarfoobarfoobarfoobar

  -r, --remote=remote

  --force              force  it force  it force  it force  it force  it force
                       it force  it force  it force  it force  it force  it
                       force  it force  it force  it force  it

  --ss                 newliney
                       newliney
                       newliney
                       newliney

ALIASES
  $ dxcli app:init
  $ dxcli create`))
})