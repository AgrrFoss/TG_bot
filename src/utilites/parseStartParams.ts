export interface IPageStartParams {
  usr?: string;
  umd?: string;
  ucm?: string;
  ucn?: string;
  utr?: string;
}

const parseStartParams = (startParams: string): IPageStartParams => {
  const params: Record<string, string> = {};
  const paramPairs = startParams.split('_');
  for (const pair of paramPairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = value;
    }
  }
  return params;
};
export default parseStartParams;
