// first frame a browser sends to the relay, as JSON text
export type TRelayJoin = {
  linkId: string;
  token: string;
};

// the values are the text frames the relay sends to a browser
export enum RelayNotice {
  PAIRED = 'paired',
}
