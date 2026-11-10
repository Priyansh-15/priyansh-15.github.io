export const site = {
  name: 'Priyansh Sharma',
  title: 'Priyansh Sharma — Software Engineer',
  description:
    'Backend and distributed systems engineer designing reliable infrastructure, data processing systems, and engineering tools.',
  url: 'https://priyansh-15.github.io',
  github: 'https://github.com/Priyansh-15',
  linkedin: 'https://www.linkedin.com/in/priyansh-sharma-bb4095216/',
} as const;

export const work = [
  {
    number: '01',
    category: 'DISTRIBUTED DATA PROCESSING',
    title: 'Building a distributed billing and reporting pipeline',
    description:
      'A technical exploration of orchestration, concurrent processing, coordination, and performance validation in a multi-stage reporting system.',
    tags: ['Java', 'Distributed systems', 'Cassandra'],
    status: 'Case study in preparation',
    icon: 'pipeline',
  },
  {
    number: '02',
    category: 'BACKEND ARCHITECTURE',
    title: 'Redesigning an order scheduling framework',
    description:
      'Decoupling planning from execution, defining rule-driven interactions, and reasoning about reliability and failure recovery.',
    tags: ['Java', 'Architecture', 'Reliability'],
    status: 'Case study in preparation',
    icon: 'scheduler',
  },
  {
    number: '03',
    category: 'DEVELOPER TOOLS',
    title: 'Engineering with persistent AI context',
    description:
      'Exploring knowledge capture and retrieval to make AI-assisted development more coherent across complex, long-running engineering tasks.',
    tags: ['AI engineering', 'Developer tooling', 'Knowledge systems'],
    status: 'Case study in preparation',
    icon: 'intelligence',
  },
] as const;
