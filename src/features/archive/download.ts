export function downloadTextFile(opts: { filename: string; content: string; mime: string }) {
  const blob = new Blob([opts.content], { type: opts.mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = opts.filename;
  a.rel = 'noopener';
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
