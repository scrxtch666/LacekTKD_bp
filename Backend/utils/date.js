const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const parsed = new Date(year, month - 1, day);

  if (isNaN(parsed.getTime())) return null;

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

module.exports = { parseDateSafe };
