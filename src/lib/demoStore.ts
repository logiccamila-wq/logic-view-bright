export function demoList(table: string): any[] {
  const raw = localStorage.getItem(`demo:${table}`) || '[]';
  try { return JSON.parse(raw) || []; } catch { return []; }
}

export function demoCreate(table: string, data: any): any {
  const arr = demoList(table);
  const id = data?.id || `${Date.now()}-${Math.floor(Math.random()*1e6)}`;
  const row = { id, ...data };
  arr.unshift(row);
  localStorage.setItem(`demo:${table}`, JSON.stringify(arr));
  return row;
}

export function demoDelete(table: string, id: any): void {
  const arr = demoList(table).filter((x: any) => (x.id || x) !== id);
  localStorage.setItem(`demo:${table}`, JSON.stringify(arr));
}
