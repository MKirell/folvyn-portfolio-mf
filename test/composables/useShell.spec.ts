import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useShell, type ShellLine } from '@/composables/useShell'
import { useLanguage } from '@/composables/useLanguage'
import { usePortfolioStore } from '@/stores/portfolio'
import { fixtures } from '../setup'
import { messagesFor } from '@/i18n/messages'
import { displayPhone, fullName, linkedinHandle } from '@/utils/person'
import { formatPeriod } from '@/utils/period'
import type { ApiPortfolio } from '@/types/api'

const person = fixtures.en.person

function patch(changes: Partial<ApiPortfolio>): void {
  const store = usePortfolioStore()
  store.data = { ...(store.data as ApiPortfolio), ...changes }
}

function createShell() {
  const shell = useShell()

  function run(command: string): ShellLine[] {
    const before = shell.lines.value.length
    shell.inputValue.value = command
    shell.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }))
    return shell.lines.value.slice(before)
  }

  function text(lines: ShellLine[]): string {
    return lines.map((line) => line.text).join('\n')
  }

  return { ...shell, run, text }
}

describe('useShell', () => {
  beforeEach(async () => {
    await useLanguage().setLang('en')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('the prompt', () => {
    it('starts empty and prints the welcome banner on first activation', async () => {
      const shell = createShell()
      expect(shell.lines.value).toHaveLength(0)

      shell.activate()
      expect(shell.lines.value.length).toBeGreaterThan(0)
    })

    it('only greets once however many times it is activated', async () => {
      const shell = createShell()
      shell.activate()
      const after = shell.lines.value.length
      shell.activate()

      expect(shell.lines.value).toHaveLength(after)
    })

    it('exposes the localised placeholder', async () => {
      const shell = createShell()
      expect(shell.placeholder.value).toBe(messagesFor('en').shell.placeholder)

      await useLanguage().setLang('fr')
      expect(shell.placeholder.value).toBe(messagesFor('fr').shell.placeholder)
    })

    it('echoes the command back as a prompt line and clears the input', async () => {
      const shell = createShell()
      const output = shell.run('whoami')

      expect(output[0].kind).toBe('prompt')
      expect(output[0].text).toBe('whoami')
      expect(shell.inputValue.value).toBe('')
    })

    it('does nothing beyond the prompt for a blank command', async () => {
      const shell = createShell()
      expect(shell.run('   ')).toHaveLength(1)
    })

    it('reports an unknown command and points at help', async () => {
      const shell = createShell()
      const output = shell.run('banana')

      expect(output.some((line) => line.kind === 'error')).toBe(true)
      expect(shell.text(output)).toContain('banana')
    })

    it('is case insensitive about command names', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('WHOAMI'))).toContain(fullName(person))
    })
  })

  describe('content commands', () => {
    it('prints the about section', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('about'))

      expect(output).toContain(messagesFor('en').headings.about)
      expect(output).toContain(fixtures.en.person.aboutParagraphs[0])
    })

    it('prints every skill category with its tags', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('skills'))

      for (const category of fixtures.en.skillCategories) {
        expect(output).toContain(category.title)
      }
    })

    it('prints every job with role, period and bullets', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('experience'))

      for (const job of fixtures.en.experiences) {
        expect(output).toContain(job.company)
        expect(output).toContain(formatPeriod(job, 'en'))
      }
    })

    it('prints a single job by slug', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('experience acme-corp-personal-finance-mobility'))

      expect(output).toContain('Acme Corp Personal Finance & Mobility')
    })

    it('reports an unknown job slug as a missing file', async () => {
      const shell = createShell()
      const output = shell.run('experience nowhere')

      expect(output.some((line) => line.kind === 'error')).toBe(true)
    })

    it('prints every project', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('projects'))

      for (const project of fixtures.en.projects) {
        expect(output).toContain(project.title)
      }
    })

    it('prints a single project by slug', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('projects cvision'))

      expect(output).toContain('CVision')
      expect(output).toContain(fixtures.en.projects[0].badge)
    })

    it('reports an unknown project slug', async () => {
      const shell = createShell()

      expect(shell.run('proj nothing').some((line) => line.kind === 'error')).toBe(true)
    })

    it('prints education with degrees, certifications and languages', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('education'))

      expect(output).toContain(messagesFor('en').labels.degrees)
      expect(output).toContain(messagesFor('en').labels.certifications)
      expect(output).toContain(messagesFor('en').labels.spokenLanguages)
    })

    it('prints achievements with volunteering and awards', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('achievements'))

      expect(output).toContain(messagesFor('en').labels.volunteering)
      expect(output).toContain(messagesFor('en').labels.awards)
    })

    it('prints contact details from the person record', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('contact'))

      expect(output).toContain(person.email)
      expect(output).toContain(displayPhone(person.phone))
      expect(output).toContain(linkedinHandle(person.linkedin))
    })

    it('prints a neofetch card', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('neofetch'))

      expect(output).toContain(person.affiliation)
      expect(output).toContain(person.city)
    })

    it.each([
      ['exp', 'experience'],
      ['proj', 'projects'],
      ['edu', 'education'],
      ['fetch', 'neofetch'],
      ['cv', 'resume'],
    ])('treats %s as an alias of %s', (alias, canonical) => {
      vi.spyOn(window, 'open').mockImplementation(() => null)
      const a = createShell()
      const b = createShell()

      const aliased = a.run(alias).slice(1)
      const canonicalOutput = b.run(canonical).slice(1)

      expect(a.text(aliased)).toBe(b.text(canonicalOutput))
    })
  })

  describe('filesystem commands', () => {
    it('lists the root files', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('ls'))).toContain('about.md')
    })

    it('lists job logs', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('ls experience'))).toContain('.log')
    })

    it('lists project files', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('ls projects/'))).toContain('.proj')
    })

    it('reports an unknown directory', async () => {
      const shell = createShell()

      expect(shell.run('ls nowhere').some((line) => line.kind === 'error')).toBe(true)
    })

    it('cats a known document', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('cat about.md'))).toContain(messagesFor('en').headings.about)
    })

    it('cats a job log by path', async () => {
      const shell = createShell()
      const output = shell.text(
        shell.run('cat experience/vermeg-for-banking-insurance-software.log'),
      )

      expect(output).toContain('VERMEG')
    })

    it('cats a project file by path', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('cat projects/cvision.proj'))).toContain('CVision')
    })

    it('explains usage when cat gets no argument', async () => {
      const shell = createShell()

      expect(shell.run('cat').some((line) => line.kind === 'error')).toBe(true)
    })

    it('reports a missing file', async () => {
      const shell = createShell()

      expect(shell.run('cat nope.md').some((line) => line.kind === 'error')).toBe(true)
    })

    it('reports the working directory', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('pwd'))).toContain(messagesFor('en').shell.promptUser)
    })
  })

  describe('navigation and links', () => {
    it('scrolls to a known section', async () => {
      const section = document.createElement('section')
      section.id = 'projects'
      document.body.appendChild(section)
      const scrollIntoView = vi.fn()
      section.scrollIntoView = scrollIntoView

      const shell = createShell()
      shell.run('cd projects')

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
      section.remove()
    })

    it.each(['~', '..'])('treats %s as the top of the page', (target) => {
      const shell = createShell()
      const output = shell.text(shell.run(`cd ${target}`))

      expect(output).toContain('hero')
    })

    it('explains usage when cd gets no argument', async () => {
      const shell = createShell()

      expect(shell.run('cd').some((line) => line.kind === 'error')).toBe(true)
    })

    it('reports an unknown section', async () => {
      const shell = createShell()

      expect(shell.run('cd atlantis').some((line) => line.kind === 'error')).toBe(true)
    })

    it('opens external profiles in a new tab with noopener', async () => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null)
      const shell = createShell()

      shell.run('github')
      expect(open).toHaveBeenCalledWith(person.github, '_blank', 'noopener,noreferrer')

      shell.run('linkedin')
      expect(open).toHaveBeenCalledWith(person.linkedin, '_blank', 'noopener,noreferrer')
    })

    it('opens the resume for the active language', async () => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null)
      const shell = createShell()

      shell.run('resume')
      expect(shell.text(shell.lines.value)).toContain(fixtures.en.person.resume!)

      await useLanguage().setLang('fr')
      shell.run('resume')
      expect(shell.text(shell.lines.value)).toContain(fixtures.fr.person.resume!)
      expect(open).toHaveBeenCalled()
    })
  })

  describe('language switching', () => {
    it('switches the interface language', async () => {
      const shell = createShell()
      shell.run('lang fr')
      await vi.waitFor(() => expect(useLanguage().lang.value).toBe('fr'))
    })

    it('rejects an unsupported language', async () => {
      const shell = createShell()

      expect(shell.run('lang de').some((line) => line.kind === 'error')).toBe(true)
      expect(useLanguage().lang.value).toBe('en')
    })

    it('rejects a missing language argument', async () => {
      const shell = createShell()

      expect(shell.run('lang').some((line) => line.kind === 'error')).toBe(true)
    })

    it('renders subsequent output in the new language', async () => {
      const shell = createShell()
      shell.run('lang fr')

      expect(shell.text(shell.run('about'))).toContain(messagesFor('fr').headings.about)
    })
  })

  describe('help and man', () => {
    it('lists every documented command', async () => {
      const shell = createShell()
      const output = shell.text(shell.run('help'))

      for (const item of messagesFor('en').shell.helpItems) {
        expect(output).toContain(item.cmd)
      }
    })

    it('explains a single command', async () => {
      const shell = createShell()
      const first = messagesFor('en').shell.helpItems[0]

      expect(shell.text(shell.run(`man ${first.cmd.split(' ')[0]}`))).toContain(first.desc)
    })

    it('reports an undocumented command', async () => {
      const shell = createShell()

      expect(shell.run('man banana').some((line) => line.kind === 'error')).toBe(true)
    })

    it('explains usage when man gets no argument', async () => {
      const shell = createShell()

      expect(shell.run('man').some((line) => line.kind === 'error')).toBe(true)
    })
  })

  describe('what the portfolio does not have', () => {
    const en = messagesFor('en')

    it('leaves an empty section out of help', () => {
      patch({ projects: [], skillCategories: [] })
      const shell = createShell()
      const output = shell.text(shell.run('help'))

      expect(output).toContain('experience')
      expect(output).not.toContain('featured projects')
      expect(output).not.toContain('technical skills')
    })

    it('treats the command for an empty section as unknown', () => {
      patch({ projects: [] })
      const shell = createShell()
      const output = shell.run('projects')

      expect(output.some((line) => line.kind === 'error')).toBe(true)
      expect(shell.text(output)).toContain(en.shell.messages.tryHelp)
    })

    it('keeps the command once the section has an entry again', () => {
      patch({ projects: fixtures.en.projects })
      const shell = createShell()

      expect(shell.text(shell.run('projects'))).toContain(fixtures.en.projects[0].title)
    })

    it('lists only the files the portfolio serves', () => {
      patch({ projects: [], skillCategories: [] })
      const shell = createShell()
      const output = shell.text(shell.run('ls'))

      expect(output).toContain('about.md')
      expect(output).not.toContain('projects/')
      expect(output).not.toContain('skills.md')
    })

    it('reports a file for an empty section as missing', () => {
      patch({ skillCategories: [] })
      const shell = createShell()

      expect(shell.run('cat skills.md').some((line) => line.kind === 'error')).toBe(true)
    })

    it('prints only the education lists that have entries', () => {
      patch({
        education: { ...fixtures.en.education, certifications: [], spokenLanguages: [] },
      })
      const shell = createShell()
      const output = shell.text(shell.run('education'))

      expect(output).toContain(en.labels.degrees)
      expect(output).not.toContain(en.labels.certifications)
      expect(output).not.toContain(en.labels.spokenLanguages)
    })

    it('prints only the achievements lists that have entries', () => {
      patch({ achievements: { ...fixtures.en.achievements, awards: [] } })
      const shell = createShell()
      const output = shell.text(shell.run('achievements'))

      expect(output).toContain(en.labels.volunteering)
      expect(output).not.toContain(en.labels.awards)
    })

    it('says so rather than opening nothing when there is no CV', () => {
      const open = vi.spyOn(window, 'open').mockImplementation(() => null)
      patch({ person: { ...fixtures.en.person, resume: null } })
      const shell = createShell()
      const output = shell.run('resume')

      expect(output.some((line) => line.kind === 'error')).toBe(true)
      expect(open).not.toHaveBeenCalled()
    })

    it('names the sections it renders when cd is given a bad target', () => {
      patch({ projects: [], skillCategories: [] })
      const shell = createShell()
      const output = shell.text(shell.run('cd atlantis'))

      expect(output).toContain('about')
      expect(output).not.toContain('skills')
    })

    it('leaves an empty section out of neofetch', () => {
      patch({ skillCategories: [] })
      const shell = createShell()

      expect(shell.text(shell.run('neofetch'))).not.toContain('Stack:')
    })
  })

  describe('easter eggs', () => {
    it('grants the sandwich only with sudo', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('sudo make me a sandwich'))).toBe(
        `sudo make me a sandwich\n${messagesFor('en').shell.messages.sudoSandwich}`,
      )
    })

    it('refuses a recursive delete', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('sudo rm -rf /'))).toContain(
        messagesFor('en').shell.messages.sudoRm,
      )
    })

    it('denies any other sudo request', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('sudo reboot'))).toContain(
        messagesFor('en').shell.messages.sudoDenied,
      )
    })

    it.each(['sl', 'dir', 'exit'])('answers %s with its scripted line', (command) => {
      const shell = createShell()

      expect(shell.run(command).length).toBeGreaterThan(1)
    })

    it('echoes back its arguments', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('echo hello there'))).toContain('hello there')
    })
  })

  describe('history', () => {
    it('counts the history command itself as the first entry', async () => {
      const shell = createShell()

      expect(shell.text(shell.run('history'))).toContain('1  history')
    })

    it('numbers the commands that have been run', async () => {
      const shell = createShell()
      shell.run('whoami')
      shell.run('pwd')

      const output = shell.text(shell.run('history'))
      expect(output).toContain('1  whoami')
      expect(output).toContain('2  pwd')
    })

    it('walks backwards through history with ArrowUp', async () => {
      const shell = createShell()
      shell.run('whoami')
      shell.run('pwd')

      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(shell.inputValue.value).toBe('pwd')

      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(shell.inputValue.value).toBe('whoami')
    })

    it('stops at the oldest entry', async () => {
      const shell = createShell()
      shell.run('whoami')

      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(shell.inputValue.value).toBe('whoami')
    })

    it('walks forward again with ArrowDown and ends on a blank line', async () => {
      const shell = createShell()
      shell.run('whoami')
      shell.run('pwd')

      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))

      expect(shell.inputValue.value).toBe('')
    })

    it('ignores history keys when nothing has been run', async () => {
      const shell = createShell()

      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      shell.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))

      expect(shell.inputValue.value).toBe('')
    })
  })

  describe('autocomplete', () => {
    function tab(shell: ReturnType<typeof createShell>, value: string) {
      shell.inputValue.value = value
      shell.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }))
      return shell
    }

    it('completes a unique command prefix', async () => {
      const shell = createShell()
      tab(shell, 'neo')

      expect(shell.inputValue.value).toBe('neofetch ')
    })

    it('lists the options for an ambiguous prefix', async () => {
      const shell = createShell()
      const before = shell.lines.value.length
      tab(shell, 'e')

      expect(shell.lines.value.length).toBeGreaterThan(before)
      expect(shell.inputValue.value).toBe('e')
    })

    it('does nothing on an empty input', async () => {
      const shell = createShell()
      tab(shell, '')

      expect(shell.lines.value).toHaveLength(0)
    })

    it('completes a file path after cat', async () => {
      const shell = createShell()
      tab(shell, 'cat abo')

      expect(shell.inputValue.value).toBe('cat about.md')
    })

    it('completes a section after cd', async () => {
      const shell = createShell()
      tab(shell, 'cd proj')

      expect(shell.inputValue.value).toBe('cd projects')
    })

    it('completes a language code after lang', async () => {
      const shell = createShell()
      tab(shell, 'lang f')

      expect(shell.inputValue.value).toBe('lang fr')
    })

    it('completes a command name after man', async () => {
      const shell = createShell()
      tab(shell, 'man neo')

      expect(shell.inputValue.value).toBe('man neofetch')
    })

    it('leaves arguments alone for commands that take none', async () => {
      const shell = createShell()
      tab(shell, 'whoami xy')

      expect(shell.inputValue.value).toBe('whoami xy')
    })

    it('lists ambiguous argument matches instead of guessing', async () => {
      const shell = createShell()
      const before = shell.lines.value.length
      tab(shell, 'cat ')

      expect(shell.lines.value.length).toBeGreaterThan(before)
    })
  })

  describe('other keys', () => {
    it('clears the screen with clear', async () => {
      const shell = createShell()
      shell.run('whoami')
      shell.run('clear')

      expect(shell.lines.value).toHaveLength(0)
    })

    it('clears the screen with Ctrl+L', async () => {
      const shell = createShell()
      shell.run('whoami')
      shell.onKeydown(new KeyboardEvent('keydown', { key: 'l', ctrlKey: true }))

      expect(shell.lines.value).toHaveLength(0)
    })

    it('blurs the input on Escape', async () => {
      const shell = createShell()
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      const blur = vi.spyOn(input, 'blur')

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      Object.defineProperty(event, 'target', { value: input })
      shell.onKeydown(event)

      expect(blur).toHaveBeenCalled()
      input.remove()
    })

    it('ignores an ordinary keystroke', async () => {
      const shell = createShell()
      shell.onKeydown(new KeyboardEvent('keydown', { key: 'a' }))

      expect(shell.lines.value).toHaveLength(0)
    })
  })
})
