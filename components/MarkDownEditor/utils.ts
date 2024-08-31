function converSpaces(input: string[]): string[] {
	let result: string[] = [];
  for (const s of input) {
    if (s === ''){
      result = result.concat(' ')
    } else result = result.concat(s)
  }
	return result;
}
