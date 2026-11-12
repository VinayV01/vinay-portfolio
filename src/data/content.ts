// Single source of truth for every word on the page. Everything here comes from the resume.

export const PROFILE = {
  name: 'Vinay V Nair',
  firstName: 'Vinay',
  title: 'Python Full Stack Developer',
  location: 'Kochi, Kerala',
  email: 'vinayvnair0@gmail.com',
  linkedin: 'https://linkedin.com/in/vinay-v-nair-4540a3301',
  resume: '/Vinay-V-Nair-Resume.pdf',
  experience: '1.5+',
};

export const HERO_LINES = [
  'Building digital experiences.',
  'From backend logic to interactive interfaces.',
  'Turning ideas into working products.',
];

export const MARQUEE_PRIMARY = ['Python', 'Django', 'React', 'Next.js', 'JavaScript', 'SQL', 'REST APIs'];
export const MARQUEE_SECONDARY = [
  'Full Stack Development',
  'SQL Server',
  'Payload CMS',
  'MongoDB',
  'IIS Deployment',
  'Power BI',
  'Responsive Interfaces',
];

export const ABOUT_STATEMENT =
  "I'm a Python Full Stack Developer with 1.5+ years of professional experience building and maintaining web applications with Python, Django, React and Next.js. I work across the whole stack: REST APIs, SQL Server procedures, CMS-driven sites, and the interfaces people actually use.";

export const ABOUT_FACTS = [
  { k: 'Experience', v: '1.5+ years', d: 'Professional full-stack development' },
  { k: 'Currently', v: 'Voleergo Solutions', d: 'Senior Software Developer, since March 2025' },
  { k: 'Based in', v: 'Kochi, Kerala', d: 'Working from Kakkanad, Ernakulam' },
];

export const ABOUT_POINTS = [
  'REST API development and frontend-backend integration',
  'SQL Server table design, stored procedures and complex queries',
  'Payload CMS and MongoDB for content-driven websites',
  'IIS deployment, configuration and application maintenance',
  'Turning business requirements into working software across the SDLC',
];

export type SkillGroup = { id: string; label: string; items: string[] };
export const SKILLS: SkillGroup[] = [
  { id: 'lang', label: 'Programming Languages', items: ['Python', 'JavaScript', 'SQL'] },
  { id: 'back', label: 'Backend Development', items: ['Django', 'REST API Development'] },
  { id: 'front', label: 'Frontend Development', items: ['React.js', 'Next.js', 'HTML5', 'CSS3', 'Bootstrap'] },
  { id: 'db', label: 'Databases', items: ['Microsoft SQL Server', 'MySQL', 'MongoDB', 'SQLite'] },
  { id: 'cms', label: 'CMS', items: ['Payload CMS'] },
  { id: 'tools', label: 'Tools and Platforms', items: ['Git', 'GitHub', 'Postman', 'Power BI'] },
  { id: 'deploy', label: 'Deployment', items: ['IIS Server'] },
  { id: 'env', label: 'Development Environment', items: ['Visual Studio', 'Visual Studio Code'] },
];

export type Job = {
  company: string;
  place: string;
  role: string;
  period: string;
  start: string;
  points: string[];
  stack: string[];
};
export const EXPERIENCE: Job[] = [
  {
    company: 'Voleergo Solutions',
    place: 'Kakkanad, Ernakulam',
    role: 'Senior Software Developer',
    period: 'March 2025 – Present',
    start: '2025',
    points: [
      'Develop and maintain full-stack web applications with Python, Django, React and Next.js, across frontend, backend and database layers.',
      'Design, build and integrate RESTful APIs that connect frontends to backend services and carry application-specific business logic.',
      'Design and manage SQL Server databases: table structures, stored procedures, complex queries and database operations.',
      'Build responsive user interfaces and wire frontend components to backend functionality.',
      'Join client meetings and requirement discussions, translating business needs into practical software.',
      'Functional testing, debugging and performance optimisation for stability and reliability.',
      'Deploy and configure applications on IIS: production releases, environment setup, troubleshooting and maintenance.',
      'Work across the SDLC, from requirement analysis to post-deployment support.',
      'Build Power BI dashboards and reports that support business decisions.',
    ],
    stack: ['Python', 'Django', 'React', 'Next.js', 'SQL Server', 'IIS', 'Power BI'],
  },
  {
    company: 'Luminar Technolab',
    place: 'Kakkanad, Ernakulam',
    role: 'Python Full Stack Developer Intern',
    period: 'July 2024 – February 2025',
    start: '2024',
    points: [
      'Developed and maintained web application features with Python and Django.',
      'Worked with MySQL and SQLite: database design and CRUD operations.',
      'Assisted with backend functionality and integrating application components.',
      'Found and resolved application issues through debugging and testing.',
    ],
    stack: ['Python', 'Django', 'MySQL', 'SQLite'],
  },
];

export type Project = {
  n: string;
  name: string;
  kind: string;
  description: string;
  highlights: string[];
  tech: string[];
  url?: string;
  accent: string;
  visual: 'academy' | 'sports' | 'crm' | 'shop';
};
export const PROJECTS: Project[] = [
  {
    n: '01',
    name: 'Voleergo Academy',
    kind: 'Education platform',
    description:
      'A full-stack educational platform: Django REST APIs behind a React and Next.js frontend, with SQL designed and tuned to support 100+ users.',
    highlights: ['User authentication', 'Course enrollment', 'Student dashboards', 'Optimised SQL queries'],
    tech: ['Python', 'Django', 'React.js', 'Next.js', 'SQL Server'],
    url: 'https://voleergoacademy.com',
    accent: '#FF5B1F',
    visual: 'academy',
  },
  {
    n: '02',
    name: 'Regional Sports Centre',
    kind: 'Client website · RSC Kochi',
    description:
      'A dynamic, CMS-driven website built as a client project for Voleergo Solutions. Administrators manage sports events, facilities and announcements through Payload CMS.',
    highlights: ['Payload CMS + MongoDB', 'Events, facilities, announcements', 'Server-side rendering', 'SEO improvements'],
    tech: ['Next.js', 'Payload CMS', 'MongoDB'],
    url: 'https://rsckochi.com',
    accent: '#3B6CFF',
    visual: 'sports',
  },
  {
    n: '03',
    name: 'WhatsApp CRM',
    kind: 'Product · Business communication',
    description:
      'A WhatsApp CRM and business communication platform, built as a Voleergo Solutions product for commercial deployment and customer use.',
    highlights: ['WhatsApp configuration', 'Messaging automation', 'Broadcast messaging', 'Lead management', 'Role-based access'],
    tech: ['Django', 'Next.js', 'SQL Server'],
    url: 'https://whatsappcrm.voleergo.com',
    accent: '#FF4FA8',
    visual: 'crm',
  },
  {
    n: '04',
    name: 'E-commerce Platform',
    kind: 'Full-stack application',
    description:
      'A full-stack e-commerce application with Django on the backend managing products, users and orders, and a responsive React frontend.',
    highlights: ['User authentication', 'Product management', 'Shopping cart', 'Order management'],
    tech: ['Python', 'Django', 'React.js', 'SQL Server', 'Bootstrap'],
    accent: '#F4C978',
    visual: 'shop',
  },
];

export const CAPABILITIES = [
  {
    n: '01',
    title: 'Full-stack applications',
    body: 'Web applications built end to end and kept healthy after launch: frontend, backend and database layers working as one product.',
    tools: ['Python', 'Django', 'React', 'Next.js'],
  },
  {
    n: '02',
    title: 'Backend & APIs',
    body: 'RESTful APIs that connect interfaces to services and hold the business logic, designed to be clear for the frontend that consumes them.',
    tools: ['Django', 'REST APIs', 'Postman'],
  },
  {
    n: '03',
    title: 'Frontend engineering',
    body: 'Responsive interfaces in React and Next.js, integrated with real data, including server-side rendering and SEO for content sites.',
    tools: ['React.js', 'Next.js', 'HTML5', 'CSS3', 'Bootstrap'],
  },
  {
    n: '04',
    title: 'Data & databases',
    body: 'Table structures, stored procedures and complex queries in SQL Server, plus MySQL, SQLite and MongoDB where a project calls for them.',
    tools: ['SQL Server', 'MySQL', 'MongoDB', 'SQLite'],
  },
  {
    n: '05',
    title: 'Business solutions',
    body: 'From client meetings to IIS production deployments and Power BI reporting, turning requirements into software a business can run on.',
    tools: ['IIS', 'Power BI', 'Payload CMS'],
  },
];

export const JOURNEY = [
  {
    year: '2019',
    title: 'Diploma in Computer Engineering',
    place: 'Government Polytechnic College, Perumbavoor',
    note: 'July 2019 – June 2021 · CGPA 8.01',
  },
  {
    year: '2021',
    title: 'B.Tech, Computer Science and Engineering',
    place: 'College of Engineering, Adoor',
    note: 'August 2021 – June 2024 · CGPA 6.88',
  },
  {
    year: '2024',
    title: 'Python Full Stack Developer Intern',
    place: 'Luminar Technolab, Kakkanad',
    note: 'First production work with Python, Django, MySQL and SQLite.',
  },
  {
    year: '2025',
    title: 'Senior Software Developer',
    place: 'Voleergo Solutions, Kakkanad',
    note: 'Full-stack products, client projects, SQL Server, IIS and Power BI.',
  },
];

export const CERTIFICATIONS = [
  'C for Everyone: Programming Fundamentals',
  'Programming for Everybody: Getting Started with Python',
  'Introduction to HTML',
];

export const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
];
