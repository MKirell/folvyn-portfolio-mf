import type { Messages } from './types'

export const DEFAULT_LANG = 'en'

export const messages: Record<string, Messages> = {
  en: {
    nav: {
      about: 'About',
      experience: 'Experience',
      projects: 'Projects',
      skills: 'Skills',
      education: 'Education',
      achievements: 'Achievements',
      contact: 'Contact',
    },
    headings: {
      about: 'Who am I?',
      experience: 'Where have I worked?',
      projects: 'What have I built?',
      skills: 'What can I do?',
      education: 'What did I study?',
      achievements: 'What have I achieved?',
      contact: 'How to reach me?',
    },
    consent: {
      title: 'Count me across visits?',
      body: 'Measurement here never identifies you. Saying yes stores one identifier on this device so return visits can be told apart from first ones. Nothing is shared, and you can change your mind at any time.',
      accept: 'Count return visits',
      refuse: 'Stay anonymous',
      note: 'no ads, no third party',
      change: 'Measurement choice',
    },
    labels: {
      currentRole: 'Ongoing',
      showMore: 'Show earlier experience',
      showLess: 'Show less',
      earlierRoles: 'earlier roles',
      privacy: 'Privacy',
      terms: 'Terms',
      degrees: 'Degrees',
      certifications: 'Certifications',
      spokenLanguages: 'Languages',
      volunteering: 'Volunteering',
      awards: 'Awards',
      email: 'Email',
      phone: 'Phone',
      linkedin: 'LinkedIn',
      location: 'Location',
      contactCta: 'Send me a message →',
    },
    hero: {
      cta: {
        projects: 'View my projects',
        contact: 'Get in touch',
      },
      card: {
        headline: 'headline',
        affiliation: 'affiliation',
        location: 'location',
        languages: 'languages',
      },
    },
    stats: {
      experience: 'years of experience',
      projects: 'personal projects',
      certifications: 'tech certifications',
      awards: 'competition awards',
    },
    period: {
      present: 'Present',
      month: 'month',
      months: 'months',
      year: 'year',
      years: 'years',
    },
    footer: '© {year} {brand} · All rights reserved',
    shell: {
      promptUser: 'guest',
      promptHost: 'folvyn',
      placeholder: "type 'help' to get started…",
      welcome: ['FolvynOS [Version 26.07.1]', "Type 'help' to see available commands.", ''],
      helpIntro: 'Available commands:',
      helpItems: [
        {
          cmd: 'help',
          desc: 'show this list',
        },
        {
          cmd: 'about',
          desc: 'who I am',
        },
        {
          cmd: 'whoami',
          desc: 'quick identity check',
        },
        {
          cmd: 'ls [dir]',
          desc: 'list sections / files',
        },
        {
          cmd: 'cat <file>',
          desc: "print a file's contents",
        },
        {
          cmd: 'skills',
          desc: 'technical skills',
        },
        {
          cmd: 'experience',
          desc: 'work history',
        },
        {
          cmd: 'projects',
          desc: 'featured projects',
        },
        {
          cmd: 'education',
          desc: 'degrees & certifications',
        },
        {
          cmd: 'achievements',
          desc: 'awards & volunteering',
        },
        {
          cmd: 'contact',
          desc: 'how to reach me',
        },
        {
          cmd: 'resume',
          desc: 'download my CV',
        },
        {
          cmd: 'github',
          desc: 'open my GitHub',
        },
        {
          cmd: 'linkedin',
          desc: 'open my LinkedIn',
        },
        {
          cmd: 'email',
          desc: 'compose an email',
        },
        {
          cmd: 'cd <section>',
          desc: 'scroll the page there',
        },
        {
          cmd: 'lang <en|fr>',
          desc: 'switch language',
        },
        {
          cmd: 'neofetch',
          desc: 'system info, my way',
        },
        {
          cmd: 'history',
          desc: 'past commands',
        },
        {
          cmd: 'clear',
          desc: 'clear the screen',
        },
        {
          cmd: 'man <cmd>',
          desc: 'manual for a command',
        },
      ],
      helpFooter: 'Tip: ↑ / ↓ browse history, Tab to autocomplete.',
      messages: {
        notFound: 'command not found: {cmd}',
        tryHelp: "Type 'help' to see available commands.",
        catNotFound: 'cat: {name}: No such file or directory',
        catUsage: 'usage: cat <file>',
        sudoDenied:
          "guest is not in the sudoers file. This incident will be reported. (not really — try 'contact' for real access 😉)",
        sudoSandwich: 'Okay. 🥪',
        sudoRm: 'Nice try. This portfolio has better backups than that. 😏',
        slJoke: "🚂💨 Choo-choo! (You meant 'ls', right?)",
        dirJoke: "This isn't Windows 😉 — try 'ls'.",
        exitMsg:
          "There's no escaping this terminal — but 'Esc' will blur the prompt if you need a breather.",
        cdUsage: 'usage: cd <section> — try one of: {sections}',
        cdUnknown: 'cd: {name}: No such section. Try one of: {sections}',
        cdNavigating: 'Navigating to #{section}…',
        cdSections: 'hero, about, experience, projects, skills, education, achievements, contact',
        langSwitched: 'Language switched to {lang}.',
        langUnknown: "Unknown language '{code}'. Try: en, fr",
        resumeOpening: 'Opening résumé ({file})…',
        linkOpening: 'Opening {url} in a new tab…',
        emailOpening: 'Opening mail client…',
        manUnknown: 'No manual entry for {cmd}',
        manUsage: 'usage: man <cmd>',
        historyEmpty: 'No command history yet.',
        whoamiRole: "You're looking at the terminal of",
      },
    },
  },
  fr: {
    nav: {
      about: 'À propos',
      experience: 'Expérience',
      projects: 'Projets',
      skills: 'Compétences',
      education: 'Formation',
      achievements: 'Réalisations',
      contact: 'Contact',
    },
    headings: {
      about: 'Qui suis-je ?',
      experience: 'Où ai-je travaillé ?',
      projects: "Qu'ai-je réalisé ?",
      skills: 'Que sais-je faire ?',
      education: "Qu'ai-je étudié ?",
      achievements: "Qu'ai-je accompli ?",
      contact: 'Comment me contacter ?',
    },
    consent: {
      title: 'Compter mes visites successives ?',
      body: "La mesure d'audience ne vous identifie jamais. En acceptant, un identifiant est conservé sur cet appareil afin de distinguer une visite de retour d'une première visite. Rien n'est partagé, et vous pouvez revenir sur ce choix à tout moment.",
      accept: 'Compter les retours',
      refuse: 'Rester anonyme',
      note: 'aucune publicité, aucun tiers',
      change: 'Choix de mesure',
    },
    labels: {
      currentRole: 'En poste',
      showMore: "Voir l'expérience précédente",
      showLess: 'Voir moins',
      earlierRoles: 'postes précédents',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      degrees: 'Diplômes',
      certifications: 'Certifications',
      spokenLanguages: 'Langues',
      volunteering: 'Bénévolat',
      awards: 'Récompenses',
      email: 'E-mail',
      phone: 'Téléphone',
      linkedin: 'LinkedIn',
      location: 'Localisation',
      contactCta: "M'envoyer un message →",
    },
    hero: {
      cta: {
        projects: 'Voir mes projets',
        contact: 'Me contacter',
      },
      card: {
        headline: 'profil',
        affiliation: 'affiliation',
        location: 'localisation',
        languages: 'langues',
      },
    },
    stats: {
      experience: "années d'expérience",
      projects: 'projets personnels',
      certifications: 'certifications tech',
      awards: 'prix en compétition',
    },
    period: {
      present: "Aujourd'hui",
      month: 'mois',
      months: 'mois',
      year: 'an',
      years: 'ans',
    },
    footer: '© {year} {brand} · Tous droits réservés',
    shell: {
      promptUser: 'invite',
      promptHost: 'folvyn',
      placeholder: "tapez 'help' pour commencer…",
      welcome: [
        'FolvynOS [Version 26.07.1]',
        "Tapez 'help' pour voir les commandes disponibles.",
        '',
      ],
      helpIntro: 'Commandes disponibles :',
      helpItems: [
        {
          cmd: 'help',
          desc: 'afficher cette liste',
        },
        {
          cmd: 'about',
          desc: 'qui je suis',
        },
        {
          cmd: 'whoami',
          desc: 'identité rapide',
        },
        {
          cmd: 'ls [dir]',
          desc: 'lister sections / fichiers',
        },
        {
          cmd: 'cat <file>',
          desc: 'afficher un fichier',
        },
        {
          cmd: 'skills',
          desc: 'compétences techniques',
        },
        {
          cmd: 'experience',
          desc: 'expérience professionnelle',
        },
        {
          cmd: 'projects',
          desc: 'projets phares',
        },
        {
          cmd: 'education',
          desc: 'diplômes & certifications',
        },
        {
          cmd: 'achievements',
          desc: 'récompenses & bénévolat',
        },
        {
          cmd: 'contact',
          desc: 'comment me contacter',
        },
        {
          cmd: 'resume',
          desc: 'télécharger mon CV',
        },
        {
          cmd: 'github',
          desc: 'ouvrir mon GitHub',
        },
        {
          cmd: 'linkedin',
          desc: 'ouvrir mon LinkedIn',
        },
        {
          cmd: 'email',
          desc: 'rédiger un e-mail',
        },
        {
          cmd: 'cd <section>',
          desc: 'défiler la page jusque-là',
        },
        {
          cmd: 'lang <en|fr>',
          desc: 'changer de langue',
        },
        {
          cmd: 'neofetch',
          desc: 'infos système, à ma façon',
        },
        {
          cmd: 'history',
          desc: 'commandes passées',
        },
        {
          cmd: 'clear',
          desc: "effacer l'écran",
        },
        {
          cmd: 'man <cmd>',
          desc: "manuel d'une commande",
        },
      ],
      helpFooter: "Astuce : ↑ / ↓ pour l'historique, Tab pour autocompléter.",
      messages: {
        notFound: 'commande introuvable : {cmd}',
        tryHelp: "Tapez 'help' pour voir les commandes disponibles.",
        catNotFound: 'cat : {name} : Fichier ou dossier introuvable',
        catUsage: 'usage : cat <file>',
        sudoDenied:
          "invite n'est pas dans le fichier sudoers. Cet incident sera signalé. (pas vraiment — tapez 'contact' pour un accès réel 😉)",
        sudoSandwich: "D'accord. 🥪",
        sudoRm: 'Bien tenté. Ce portfolio a de meilleures sauvegardes que ça. 😏',
        slJoke: "🚂💨 Tchou-tchou ! (Vous vouliez dire 'ls', non ?)",
        dirJoke: "Ceci n'est pas Windows 😉 — essayez 'ls'.",
        exitMsg:
          "Impossible de fermer ce terminal — mais 'Échap' peut désactiver le prompt si besoin.",
        cdUsage: 'usage : cd <section> — essayez : {sections}',
        cdUnknown: 'cd : {name} : Section introuvable. Essayez : {sections}',
        cdNavigating: 'Navigation vers #{section}…',
        cdSections: 'hero, about, experience, projects, skills, education, achievements, contact',
        langSwitched: 'Langue changée en {lang}.',
        langUnknown: "Langue inconnue '{code}'. Essayez : en, fr",
        resumeOpening: 'Ouverture du CV ({file})…',
        linkOpening: 'Ouverture de {url} dans un nouvel onglet…',
        emailOpening: 'Ouverture du client mail…',
        manUnknown: 'Aucune entrée de manuel pour {cmd}',
        manUsage: 'usage : man <cmd>',
        historyEmpty: 'Aucun historique de commandes.',
        whoamiRole: 'Vous êtes dans le terminal de',
      },
    },
  },
}

export function messagesFor(lang: string): Messages {
  return messages[lang] ?? messages[DEFAULT_LANG]
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
