export function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>();

  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData(type: string, value: string) {
      store.set(type, value);
    },
    getData(type: string) {
      return store.get(type) ?? '';
    },
  } as DataTransfer;
}
