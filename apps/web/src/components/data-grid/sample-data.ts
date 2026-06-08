export type Person = {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'invited' | 'suspended'
  department: string
}

export const samplePeople: Array<Person> = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'admin',
    status: 'active',
    department: 'Engineering',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    role: 'admin',
    status: 'active',
    department: 'Engineering',
  },
  {
    id: '3',
    name: 'Katherine Johnson',
    email: 'katherine@example.com',
    role: 'editor',
    status: 'active',
    department: 'Research',
  },
  {
    id: '4',
    name: 'Alan Turing',
    email: 'alan@example.com',
    role: 'editor',
    status: 'invited',
    department: 'Security',
  },
  {
    id: '5',
    name: 'Dorothy Vaughan',
    email: 'dorothy@example.com',
    role: 'viewer',
    status: 'active',
    department: 'Operations',
  },
  {
    id: '6',
    name: 'Tim Berners-Lee',
    email: 'tim@example.com',
    role: 'editor',
    status: 'active',
    department: 'Platform',
  },
  {
    id: '7',
    name: 'Margaret Hamilton',
    email: 'margaret@example.com',
    role: 'admin',
    status: 'suspended',
    department: 'Engineering',
  },
  {
    id: '8',
    name: 'Edsger Dijkstra',
    email: 'edsger@example.com',
    role: 'viewer',
    status: 'invited',
    department: 'Research',
  },
  {
    id: '9',
    name: 'Barbara Liskov',
    email: 'barbara@example.com',
    role: 'editor',
    status: 'active',
    department: 'Platform',
  },
  {
    id: '10',
    name: 'Donald Knuth',
    email: 'donald@example.com',
    role: 'viewer',
    status: 'active',
    department: 'Research',
  },
  {
    id: '11',
    name: 'Shafi Goldwasser',
    email: 'shafi@example.com',
    role: 'editor',
    status: 'active',
    department: 'Security',
  },
  {
    id: '12',
    name: 'Linus Torvalds',
    email: 'linus@example.com',
    role: 'admin',
    status: 'active',
    department: 'Platform',
  },
]
