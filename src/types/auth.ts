export interface AuthUser {
  id: string;
  username: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  tokens: TokenPair;
}
