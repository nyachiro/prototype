export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export const authStorage = {
  getUser: (): User | null => {
    const user = localStorage.getItem('truthguard_user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: User) => {
    localStorage.setItem('truthguard_user', JSON.stringify(user));
  },
  
  removeUser: () => {
    localStorage.removeItem('truthguard_user');
  },
  
  login: (email: string, password: string): User | null => {
    // Mock authentication - in real app this would be API call
    const users = JSON.parse(localStorage.getItem('truthguard_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      authStorage.setUser(userWithoutPassword);
      return userWithoutPassword;
    }
    return null;
  },
  
  register: (email: string, password: string, name: string): User => {
    const users = JSON.parse(localStorage.getItem('truthguard_users') || '[]');
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'user' as const
    };
    
    users.push(newUser);
    localStorage.setItem('truthguard_users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    authStorage.setUser(userWithoutPassword);
    return userWithoutPassword;
  },
  
  logout: () => {
    authStorage.removeUser();
  }
};

// Initialize with admin user if not exists
const initializeUsers = () => {
  const users = JSON.parse(localStorage.getItem('truthguard_users') || '[]');
  if (users.length === 0) {
    const adminUser = {
      id: 'admin-1',
      email: 'admin@crecokenya.org',
      password: 'admin123',
      name: 'CRECO Admin',
      role: 'admin'
    };
    localStorage.setItem('truthguard_users', JSON.stringify([adminUser]));
  }
};

initializeUsers();