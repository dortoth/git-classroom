export interface ILogin {
  clientId: string;
  deviceCodeUrl: string;
  tokenUrl: string;
  scope?: string;
}
