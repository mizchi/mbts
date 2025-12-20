// 基本的な型とfn
export interface User {
  id: number;
  name: string;
  email?: string;
}

export function createUser(name: string): User;
export function getUser(id: number): User | undefined;
